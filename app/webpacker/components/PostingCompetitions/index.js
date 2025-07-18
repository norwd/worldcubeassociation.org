import React, { useState, useCallback } from 'react';

import {
  Button, Checkbox, Header, Segment, Table,
} from 'semantic-ui-react';
import _ from 'lodash';
import { DateTime } from 'luxon';
import useLoadedData from '../../lib/hooks/useLoadedData';
import useSaveAction from '../../lib/hooks/useSaveAction';
import Loading from '../Requests/Loading';
import Errored from '../Requests/Errored';
import RegionFlag from '../wca/RegionFlag';
import {
  adminCheckUploadedResults,
  adminPostingCompetitionsUrl,
  adminImportResultsUrl,
  adminStartPostingUrl,
  competitionUrl,
  viewUrls,
} from '../../lib/requests/routes.js.erb';

function stateReducer(accumulated, current) {
  return { ...accumulated, [current.id]: current.posting_user !== undefined };
}

function checkboxesStateFromData(competitions) {
  return competitions.reduce(stateReducer, {});
}

function PostingCompetitionsIndex({
  competitions,
  save,
  saving,
  setMessage,
  sync,
}) {
  const initialState = checkboxesStateFromData(competitions);
  const [checkboxes, setCheckboxes] = useState(initialState);

  const updater = useCallback((competitionId, value) => {
    setCheckboxes((prevState) => ({ ...prevState, [competitionId]: value }));
  }, [setCheckboxes]);

  // We want to deactivate the form if it's saving.
  const globalDisable = saving;

  const handleResponse = useCallback((json) => {
    if (json.error) {
      setMessage({ color: 'red', text: json.error });
    } else {
      setMessage({ color: 'green', text: json.message });
      sync();
    }
  }, [sync, setMessage]);

  const startPostingAction = useCallback(() => {
    const checkedCompetitions = Object.entries(checkboxes).filter(([, value]) => value);
    const competitionIds = checkedCompetitions.map(([key]) => key);
    save(adminStartPostingUrl, { competition_ids: competitionIds }, handleResponse, { method: 'POST' });
  }, [checkboxes, handleResponse, save]);

  return (
    <>
      {competitions.length === 0 && (
        <Table.Row>
          <Table.Cell colSpan={3}>
            No competitions are awaiting to be posted
          </Table.Cell>
        </Table.Row>
      )}
      {competitions.map((c) => (
        <Table.Row key={c.id}>
          <Table.Cell>
            <Header as="h5" floated="left">
              {c.name}
              <Header.Subheader>
                {c.city}
                {' '}
                <RegionFlag iso2={c.country_iso2} />
              </Header.Subheader>
              <Header.Subheader>
                {`Submission Timestamp: ${DateTime.fromISO(c.results_submitted_at).toRelative()}`}
              </Header.Subheader>
            </Header>
            <Button.Group floated="right">
              <Button
                target="_blank"
                primary
                href={competitionUrl(c.id)}
              >
                Competition page
              </Button>
              {/* Only display these if we can post. */}
              {initialState[c.id] && (
                <>
                  <Button
                    target="_blank"
                    color="olive"
                    href={adminCheckUploadedResults(c.id)}
                  >
                    Check results page
                  </Button>
                  <Button
                    target="_blank"
                    color="green"
                    href={adminImportResultsUrl(c.id)}
                  >
                    Import results page
                  </Button>
                  {c.result_ticket && (
                    <Button
                      target="_blank"
                      color="red"
                      href={viewUrls.tickets.show(c.result_ticket.id)}
                    >
                      Tickets page
                    </Button>
                  )}
                </>
              )}
            </Button.Group>
          </Table.Cell>
          <Table.Cell>
            <Checkbox
              checked={checkboxes[c.id]}
              onChange={(e, data) => updater(c.id, data.checked)}
              disabled={globalDisable || initialState[c.id]}
            />
          </Table.Cell>
          <Table.Cell>
            {c.posting_user && (
              <span>{c.posting_user.name}</span>
            )}
          </Table.Cell>
        </Table.Row>
      ))}
      <Table.Row>
        <Table.Cell />
        <Table.Cell colSpan={2}>
          <Button
            positive
            // We can't start posting if we're not allowed to, or if we didn't
            // perform any change to the initial state.
            disabled={globalDisable || _.isEqual(checkboxes, initialState)}
            onClick={startPostingAction}
          >
            Start posting
          </Button>
        </Table.Cell>
      </Table.Row>
    </>
  );
}

function PostingCompetitionsTable() {
  const {
    data, loading, error, sync,
  } = useLoadedData(adminPostingCompetitionsUrl);
  const { save, saving } = useSaveAction();
  const [message, setMessage] = useState(null);

  return (
    <>
      <Table celled>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>
              Competition
              {' '}
              <Button
                icon="sync"
                color="teal"
                onClick={() => { setMessage(null); sync(); }}
              />
            </Table.HeaderCell>
            <Table.HeaderCell>Posting</Table.HeaderCell>
            <Table.HeaderCell>Poster</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {error && (
            <Table.Row>
              <Table.Cell colSpan={3}>
                <Errored componentName="PostingCompetitionsIndex" />
              </Table.Cell>
            </Table.Row>
          )}
          {loading && (
            <Table.Row>
              <Table.Cell colSpan={3}>
                <Loading />
              </Table.Cell>
            </Table.Row>
          )}
          {!loading && data && (
            <PostingCompetitionsIndex
              competitions={data.competitions}
              save={save}
              saving={saving}
              sync={sync}
              setMessage={setMessage}
            />
          )}
        </Table.Body>
      </Table>
      {message && (
        <Segment color={message.color} inverted>
          {message.text}
        </Segment>
      )}
    </>
  );
}

export default PostingCompetitionsTable;
