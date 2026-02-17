# AWBW Replayer

Opening files only for desktop.

## Replay Files
Currently supports a replay `.zip` file which contains two GZIP compressed
files. Most of the information here is taken from Justus Lind's
AWBW-Replay-Player.

### Types

#### Null `N`
`N;` denotes a null value.

##### Examples
- `N;`

#### Boolean `s`
`s:1:"<Y|N>";` denotes a boolean where `s:1:"Y";` is `true` and `s:1:"N";` is `false`.

#### Datetime `s`
`s:19:"YYYY-MM-DD HH:mm:ss";` denotes a datetime.

#### String `s`
`s:<int>:"<str>";` denotes a string and its length.

##### Examples
- `s:5:"moved";`
- `s:10:"players_id";`

#### Integer `i`
`i:<int>;` denotes an integer.

##### Examples
- `i:0;`
- `i:80;`

#### Float `d`
`d:<float>;` denotes a floating point number.

##### Examples
- `d:10;`
- `d:7.7;`

#### Object `O`
`O:<int>:"<str>":<int>:{ ... }` denotes a JSON object with the name of the
object with the length of the name and the number of values in the object. The
JSON object are pairs of other type primitives.

##### Examples
Note that these are formatted for readability. The file content is minimized and
a single line.
- ```
  O:12:"awbwBuilding":8:{
    s:2:"id";i:78186643;
    s:8:"games_id";i:1524567;
    s:10:"terrain_id";i:53;
    s:1:"x";i:22;
    s:1:"y";i:13;
    s:7:"capture";i:20;
    s:12:"last_capture";i:20;
    s:12:"last_updated";s:19:"2025-10-08 13:05:34";
  }
  ```
- ```
  O:10:"awbwPlayer":30:{
    s:2:"id";i:3456789;
    s:8:"users_id";i:356789;
    s:8:"games_id";i:1234567;
    s:12:"countries_id";i:3;
    s:5:"co_id";i:9;
    s:5:"funds";i:7500;
    s:4:"turn";N;
    s:5:"email";N;
    s:7:"uniq_id";N;
    s:10:"eliminated";s:1:"N";
    s:9:"last_read";s:19:"2025-10-18 08:57:27";
    s:20:"last_read_broadcasts";N;
    s:10:"emailpress";N;
    s:9:"signature";N;
    s:8:"co_power";i:0;
    s:11:"co_power_on";s:1:"S";
    s:5:"order";i:22;
    s:11:"accept_draw";s:1:"N";
    s:12:"co_max_power";i:378000;
    s:13:"co_max_spower";i:882000;
    s:8:"co_image";s:8:"olaf.png";
    s:4:"team";s:7:"3538149";
    s:9:"aet_count";i:0;
    s:10:"turn_start";s:19:"2025-10-18 06:15:43";
    s:10:"turn_clock";i:3674983;
    s:10:"tags_co_id";N;
    s:13:"tags_co_power";N;
    s:17:"tags_co_max_power";N;
    s:18:"tags_co_max_spower";N;
    s:9:"interface";s:1:"N";
  }
  ```

#### Array `a`
`a:<int>:{ ... }`

##### Examples
Note that these examples are formatted for readability. The file content is
minimized and on a single line.

- ```
  a:2:{
    i:0;O:10:"awbwPlayer":30:{
      s:2:"id";i:3538148;
      s:8:"users_id";i:234567;
      s:8:"games_id";i:1524567;
      s:12:"countries_id";i:4;
      s:5:"co_id";i:9;
      s:5:"funds";i:16000;
      s:4:"turn";N;
      s:5:"email";N;
      s:7:"uniq_id";N;
      s:10:"eliminated";
      s:1:"N";
      s:9:"last_read";s:19:"2025-10-08 12:40:08";
      s:20:"last_read_broadcasts";N;
      s:10:"emailpress";N;
      s:9:"signature";N;
      s:8:"co_power";i:210500;
      s:11:"co_power_on";s:1:"N";
      s:5:"order";i:4;
      s:11:"accept_draw";s:1:"N";
      s:12:"co_max_power";i:270000;
      s:13:"co_max_spower";i:630000;
      s:8:"co_image";s:8:"olaf.png";
      s:4:"team";s:7:"3538148";
      s:9:"aet_count";i:0;
      s:10:"turn_start";s:19:"2025-10-11 01:26:59";
      s:10:"turn_clock";i:2597189;
      s:10:"tags_co_id";N;
      s:13:"tags_co_power";N;
      s:17:"tags_co_max_power";N;
      s:18:"tags_co_max_spower";N;
      s:9:"interface";s:1:"N";
    }
    i:1;O:10:"awbwPlayer":30:{
      s:2:"id";i:3538149;
      s:8:"users_id";i:345678;
      s:8:"games_id";i:1524567;
      s:12:"countries_id";i:3;
      s:5:"co_id";i:9;
      s:5:"funds";i:4000;
      s:4:"turn";N;
      s:5:"email";N;
      s:7:"uniq_id";N;
      s:10:"eliminated";s:1:"N";
      s:9:"last_read";s:19:"2025-10-11 01:11:50";
      s:20:"last_read_broadcasts";N;
      s:10:"emailpress";N;
      s:9:"signature";N;
      s:8:"co_power";i:188500;
      s:11:"co_power_on";s:1:"N";
      s:5:"order";i:22;
      s:11:"accept_draw";s:1:"N";
      s:12:"co_max_power";i:270000;
      s:13:"co_max_spower";i:630000;
      s:8:"co_image";s:8:"olaf.png";
      s:4:"team";s:7:"3538149";
      s:9:"aet_count";i:0;
      s:10:"turn_start";s:19:"2025-10-11 01:10:03";
      s:10:"turn_clock";i:2542326;
      s:10:"tags_co_id";N;
      s:13:"tags_co_power";N;
      s:17:"tags_co_max_power";N;
      s:18:"tags_co_max_spower";N;
      s:9:"interface";s:1:"N";
    }
  }
  ```

### Turn File
This is the file named with only numbers.

```
{
  "id": integer,                  # ID of the game.
  "name": string,                 # Name of the game.
  "password": string | null,
  "creator": integer,             # ID of the player who created the game.
  "start_date": datetime,         # Datetime when current turn started.
  "end_date": datetime | null,    # Datetime when current turn ended.
  "activity_date": datetime,      # Datetime when the last action was
                                  # performed.
  "maps_id": integer,             # ID of the map.
  "weather_type": string,         # Type of weather of the game
  "weather_start": string | null, # ID of the turn when the current weather.
                                  # started, null if weather has not changed
                                  # since start of game.
  "weather_code": string,         # Type of weather of the current team:
                                  # - "C": clear
                                  # - "R": rain
                                  # - "S": snow
  "win_condition": string | null,
  "turn": integer,                # ID of the player taking the current turn
  "day": integer,                 # Day of current turn.
  "active": boolean,
  "funds": integer,               # Amount of funds each building gives per
                                  # turn.
  "capture_win": integer,         # Number of buildings required to win.
  "fog": boolean,                 # Fog of war enabled.
  "comment": string | null,
  "type": string,                 # Type of game:
                                  # - "L": league
                                  # - "N": normal
                                  # - "A": tag
  "boot_interval": integer,
  "starting_funds": integer,      # Amount of funds given to each player at
                                  # start of game.
  "official": boolean,
  "min_rating": integer | null,
  "max_rating": integer | null,
  "league": boolean | null,       # Game is a league match.
  "team": boolean,                # Game is a team game.
  "aet_interval": integer,
  "aet_date": datetime,
  "use_powers": boolean,          # CO powers are enabled.
  "players": array[
    {
      "id": integer,                        # ID of the player.
      "users_id": integer,                  # ID of the user.
      "games_id": integer,                  # ID of the game.
      "countries_id": integer,              # ID of the country the player is
                                            # playing as.
      "co_id": integer,                     # ID of the CO the player is
                                            # playing as.
      "funds": integer,                     # The amount of funds the player has
                                            # at the start of the turn.
      "turn": string | null,
      "email": string | null,
      "uniq_id": integer | null,
      "eliminated": boolean,                # Player is eliminated from the
                                            # game.
      "last_read": datetime,
      "last_read_broadcasts": string | null,
      "emailpress": null,
      "signature": null,
      "co_power": integer,                  # Current amount of CO power.
      "co_power_on": string,                # CO power is active.
                                            # - "S": super
                                            # - "Y": normal
                                            # - "N": no power
      "order": integer,                     # Order of when the player takes
                                            # their turn.
      "accept_draw": boolean,               # Player accepted a draw.
      "co_max_power": integer | null,       # Amount of CO power needed to
                                            # activate the normal power.
      "co_max_spower": integer | null,      # Amount of CO power needed to
                                            # activate the super power.
      "co_image": string,                   # The image of the CO.
      "team": string,                       # Team the player is on.
      "aet_count": integer,                 # Seconds until automatically ends
                                            # turn.
      "turn_start": datetime,               # Datetime when the player started
                                            # their turn.
      "turn_clock": integer,                # Seconds the player has left to
                                            # complete their turn at the start
                                            # of the current turn.
      "tags_co_id": integer | null,         # ID of the tag CO.
      "tags_co_power": integer | null,      # Amount of CO power of the tag CO.
      "tags_co_max_power": integer | null,  # Amount of CO power required to
                                            # activate the normal power of the
                                            # tag CO.
      "tags_co_max_spower": integer | null, # Amount of CO power required to
                                            # activate the super power of the
                                            # tag CO.
      "interface": boolean,
    },
    { ... },
    ...
  ],
    "buildings": array[
        {
            "id": integer,
            "games_id": integer,
            "terrain_id": integer,
            "x": integer,
            "y": integer,
            "capture": integer,
            "last_capture": integer,
            "last_updated": datetime,
        },
        { ... },
        ...
    ],
    "units": array[
        {
            "id": integer,
            "games_id": integer,
            "players_id": integer,
            "name": string
            "movement_points": integer,
            "vision": integer,
            "fuel": integer,
            "fuel_per_turn": integer,
            "sub_dive": boolean,
            "ammo": integer,
            "short_range": integer,
            "long_range": integer,
            "second_weapon": boolean,
            "symbol": string,
            "cost": integer,
            "movement_type": string,
            "x": integer,
            "y": integer,
            "moved": integer,
            "capture": integer,
            "fired": integer,
            "hit_points": integer,
            "cargo1_units_id": integer,
            "cargo2_units_id": integer,
            "carried": boolean,
        },
        { ... },
        ...
    ],
    "timers_initial": integer,
    "timers_increment": integer,
    "timers_max_turn": integer,
}
```

### Action File
This is the file that starts with `a`.