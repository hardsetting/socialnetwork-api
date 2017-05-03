create or replace view vw_suggestions as
select
  f1.user_id user_id, f2.friend_id suggested_friend_id, count(*) score
from vw_friendship f1
inner join vw_friendship f2
  on f1.friend_id = f2.user_id
where f2.friend_id not in (
  select friend_id
  from vw_friendship
  where user_id = f1.user_id
) and f2.friend_id != f1.user_id

group by f1.user_id, f2.friend_id;
--order by count(*) desc;