create or replace function fn_update_user_friends()
  returns trigger as
$BODY$
begin
  if (tg_op = 'UPDATE' or tg_op = 'DELETE') and old.accepted_at is not null THEN
    update "user"
      set friends_count = friends_count - 1
    where "user".id = old.requester_user_id
    or "user".id = old.requested_user_id;
  END IF;

  if (tg_op = 'UPDATE' or tg_op = 'INSERT') and new.accepted_at is not null THEN
    update "user"
    set friends_count = friends_count + 1
    where "user".id = new.requester_user_id
          or "user".id = new.requested_user_id;
  END IF;

  return new;
end
$BODY$
language plpgsql;

create trigger tr_user_friends
AFTER insert or update or delete
  on "friendship"
  for each row
  EXECUTE PROCEDURE fn_update_user_friends()