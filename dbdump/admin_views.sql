create or replace view vw_in_degree
as
  SELECT
    requested_user_id as user_id,
    count(requester_user_id) as in_degree
  from friendship
  group by requested_user_id;

create or replace view vw_out_degree
as
  SELECT
    requester_user_id as user_id,
    count(requested_user_id) as out_degree
  from friendship
  group by requester_user_id;


create or replace view vw_degree
as
  select
    "user".id as user_id,
    count(vw_friendship.friend_id) degree
  from "user"
  left join vw_friendship
    on "user".id = vw_friendship.user_id
  group by "user".id;
