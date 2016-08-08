-- timelapse stack datamodel

CREATE KEYSPACE timlapse WITH replication = {'class': 'SimpleStrategy', 'replication_factor': '1'};

CREATE TABLE timlapse.captures_by_time (
    device text,
    capturetime timestamp,
    date date,
    day text,
    fs_path text,
    idx_path text,
    idx_path_medium text,
    idx_path_small text,
    hour text,
    minute text,
    month text,
    second text,
    time text,
    tz text,
    week int,
    year text,
    PRIMARY KEY ((device, capturetime), date)
) WITH CLUSTERING ORDER BY (date ASC);