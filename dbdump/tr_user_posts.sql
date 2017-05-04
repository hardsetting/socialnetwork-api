create or replace function fn_update_user_posts()
  returns trigger as
$BODY$
begin
  if tg_op = 'UPDATE' or tg_op = 'DELETE' THEN
    update "user"
    set posts_count = posts_count - 1
    where id = old.creator_user_id;
  END IF;

  if tg_op = 'UPDATE' or tg_op = 'INSERT' THEN
    update "user"
    set posts_count = posts_count + 1
    where id = new.creator_user_id;
  END IF;

  if tg_op = 'INSERT' THEN
    insert into notification(user_id, "type", "data")
      select fr.friend_id, 1,
        ('{"post_id": ' || new.id::text || ' }')::json
    from vw_friendship fr
    where fr.user_id = new.creator_user_id;
  END IF;

  return new;
end
$BODY$
language plpgsql;

create trigger tr_user_posts
AFTER insert or update or delete
  on "post"
for each row
EXECUTE PROCEDURE fn_update_user_posts();