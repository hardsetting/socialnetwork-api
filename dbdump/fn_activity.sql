create or replace function fn_activity(an_user_id integer, datetime timestamp WITH TIME ZONE)
returns bigint
as
  $$

  select (
    select count(post.id)
    from post
    where post.creator_user_id = an_user_id
    and post.created_at > datetime
  ) * 10 + (
    select count(reaction.id)
    from reaction
    where reaction.user_id = an_user_id
    and reaction.created_at > datetime
  ) as activity;

  $$ language sql;