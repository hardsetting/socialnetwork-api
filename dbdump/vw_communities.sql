create or replace view vw_communities
as
select *
from vw_friendship
where user_id in (
select vw_hubbiness.user_id from
  vw_hubbiness
  order by hubbiness desc
  limit 5
)