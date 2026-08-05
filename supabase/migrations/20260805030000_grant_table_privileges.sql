grant usage on schema public to authenticated;
grant usage on schema public to service_role;

grant select on public.profiles to authenticated;

grant select, insert on public.donors to authenticated;
grant select, insert on public.recipients to authenticated;

grant select, insert, update, delete on public.food_donations to authenticated;
grant select, insert, update, delete on public.food_items to authenticated;

grant select, insert on public.donation_matches to authenticated;
grant select, insert on public.feedbacks to authenticated;

grant select on public.notifications to authenticated;
grant select on public.wa_logs to authenticated;
grant select on public.waste_insights to authenticated;

grant all on all tables in schema public to service_role;
