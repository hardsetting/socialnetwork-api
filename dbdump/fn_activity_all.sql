create or replace function fn_activity_all(datetime timestamp WITH TIME ZONE)
returns TABLE(user_id integer, activity bigint)
--returns bigint
as
  $$

select
  "user".id,
  coalesce(tmp1.posts_count, 0) + coalesce(tmp2.reactions_count, 0)
from "user"

  left join (
              select
                post.creator_user_id as user_id,
                count(post.id) as posts_count
              from post
              where post.created_at > datetime
                    or post.updated_at > datetime
              group by post.creator_user_id
            ) tmp1 on tmp1.user_id = "user".id

  left join (
              select reaction.user_id as user_id,
                     count(reaction.id) as reactions_count
              from reaction
              where reaction.created_at > datetime
                    or reaction.modified_at > datetime
              group by reaction.user_id
            ) tmp2 on tmp2.user_id = "user".id;

  $$ language sql;