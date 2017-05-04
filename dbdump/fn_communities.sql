create or replace function fn_communities(the_limit integer)
returns table(user_id int, friend_id int)
as
  $$

  select *
  from vw_friendship
  where user_id in (
  select vw_hubbiness.user_id from
    vw_hubbiness
    order by hubbiness desc
    limit the_limit
  )

  $$ language sql;