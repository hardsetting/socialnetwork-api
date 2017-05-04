create or replace view vw_hubbiness
as
select

"user".id as user_id,
1.0 / (
1.0/(coalesce(in_d.in_degree, 0)+1) +
1.0/(coalesce(out_d.out_degree, 0)+1)
) as hubbiness

from "user"
left join vw_in_degree in_d
  on "user".id = in_d.user_id
left join vw_out_degree out_d
  on "user".id = out_d.user_id;