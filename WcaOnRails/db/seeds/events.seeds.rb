# frozen_string_literal: true
sql = "INSERT INTO `Events` (`id`, `name`, `rank`, `format`, `cellName`) VALUES
('333', 'Rubik''s Cube', 10, 'time', 'Rubik''s Cube'),
('444', '4x4 Cube', 20, 'time', '4x4 Cube'),
('555', '5x5 Cube', 30, 'time', '5x5 Cube'),
('222', '2x2 Cube', 40, 'time', '2x2 Cube'),
('333bf', 'Rubik''s Cube: Blindfolded', 50, 'time', '3x3 blindfolded'),
('333oh', 'Rubik''s Cube: One-handed', 60, 'time', '3x3 one-handed'),
('333fm', 'Rubik''s Cube: Fewest moves', 70, 'number', '3x3 fewest moves'),
('333ft', 'Rubik''s Cube: With feet', 80, 'time', '3x3 with feet'),
('minx', 'Megaminx', 110, 'time', 'Megaminx'),
('pyram', 'Pyraminx', 120, 'time', 'Pyraminx'),
('sq1', 'Square-1', 130, 'time', 'Square-1'),
('clock', 'Rubik''s Clock', 140, 'time', 'Rubik''s Clock'),
('skewb', 'Skewb', 150, 'time', 'Skewb'),
('666', '6x6 Cube', 200, 'time', '6x6 Cube'),
('777', '7x7 Cube', 210, 'time', '7x7 Cube'),
('444bf', '4x4 Cube: Blindfolded', 500, 'time', '4x4 blindfolded'),
('555bf', '5x5 Cube: Blindfolded', 510, 'time', '5x5 blindfolded'),
('333mbf', 'Rubik''s Cube: Multiple Blindfolded', 520, 'multi', '3x3 multi blind'),
('magic', 'Rubik''s Magic', 997, 'time', 'Rubik''s Magic'),
('mmagic', 'Master Magic', 998, 'time', 'Master Magic'),
('333mbo', 'Rubik''s Cube: Multi blind old style', 999, 'multi', '3x3 multi blind old');"

ActiveRecord::Base.connection.execute(sql)
