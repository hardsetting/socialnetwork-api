create or replace view vw_friendship as
  (select
    requester_user_id as user_id,
    requested_user_id as friend_id
  from friendship)
  UNION
  (select
     requested_user_id as user_id,
     requester_user_id as friend_id
   from friendship);