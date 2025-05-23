# frozen_string_literal: true

class CompetitionEvent < ApplicationRecord
  belongs_to :competition
  belongs_to :event

  has_one :waiting_list, dependent: :destroy, as: :holder
  has_many :registration_competition_events, dependent: :destroy
  has_many :registrations, through: :registration_competition_events
  has_many :rounds, -> { order(:number) }, dependent: :destroy
  has_many :wcif_extensions, as: :extendable, dependent: :delete_all
  has_many :formats, through: :rounds
  has_many :preferred_formats, through: :event

  accepts_nested_attributes_for :rounds, allow_destroy: true

  validates :fee_lowest_denomination, numericality: { greater_than_or_equal_to: 0 }
  monetize :fee_lowest_denomination,
           as: "fee",
           with_model_currency: :currency_code

  serialize :qualification, coder: Qualification
  validates_associated :qualification

  validate do
    remaining_rounds = rounds.reject(&:marked_for_destruction?)
    numbers = remaining_rounds.map(&:number).sort
    errors.add(:rounds, "#{numbers} is wrong") if numbers != (1..remaining_rounds.length).to_a
  end

  def currency_code
    competition&.currency_code
  end

  def paid_entry?
    fee.nonzero?
  end

  def event
    Event.c_find(event_id)
  end

  def recommended_format
    preferred_formats.first&.format
  end

  def qualification_to_s
    qualification&.to_s(self)
  end

  def can_register?(user)
    competition.allow_registration_without_qualification || qualification.nil? || qualification.can_register?(user, event_id)
  end

  def to_wcif
    {
      "id" => self.event.id,
      "rounds" => self.rounds.map(&:to_wcif),
      "extensions" => wcif_extensions.map(&:to_wcif),
      "qualification" => qualification&.to_wcif,
    }
  end

  def load_wcif!(wcif)
    if self.rounds.pluck(:old_type).compact.any?
      raise WcaExceptions::BadApiParameter.new(
        "Cannot edit rounds for a competition which has qualification rounds or b-finals. Please contact WRT or WST if you need to make change to this competition.",
      )
    end
    total_rounds = wcif["rounds"].size
    new_rounds = wcif["rounds"].map do |round_wcif|
      round_number = Round.parse_wcif_id(round_wcif["id"])[:round_number]
      round = rounds.find { |r| r.wcif_id == round_wcif["id"] } || rounds.build
      round.update!(Round.wcif_to_round_attributes(self.event, round_wcif, round_number, total_rounds))
      WcifExtension.update_wcif_extensions!(round, round_wcif["extensions"]) if round_wcif["extensions"]
      round
    end
    self.rounds = new_rounds
    WcifExtension.update_wcif_extensions!(self, wcif["extensions"]) if wcif["extensions"]
    self.qualification = Qualification.load(wcif["qualification"])
    self.update!({ "qualification" => self.qualification })
    self
  end

  def self.wcif_json_schema
    {
      "type" => "object",
      "properties" => {
        "id" => { "type" => "string" },
        "rounds" => { "type" => %w[array null], "items" => Round.wcif_json_schema },
        "competitorLimit" => { "type" => %w[integer null] },
        "qualification" => Qualification.wcif_json_schema,
        "extensions" => { "type" => "array", "items" => WcifExtension.wcif_json_schema },
      },
    }
  end
end
