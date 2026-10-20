-- Testdata for ansatt-appen, så den kan prøves med én gang.
--
-- Alle navn er oppdiktet (ikke de virkelige ansattnavnene som finnes i
-- legacy/Liertoppen — dette er ny, separat HR-/ansattdata og skal ikke
-- gjenbruke ekte personopplysninger fra det gamle salgsdashbordet).
--
-- Innloggingsdetaljer for test (se README for samme info):
--   Ansatt "Mari Haugen"   — brukernavn: mari   — PIN: 1234
--   Ansatt "Jonas Berg"    — brukernavn: jonas  — PIN: 5678
--   Leder  "Silje Nordby"  — brukernavn: silje  — PIN: 9012
--                             e-post: silje@liertoppen.example
--                             passord: Liertoppen2026!
--
-- PIN-/passord-hashene under er forhåndsberegnet med
-- lib/staff/pin.ts sin hashSecret() (scrypt + tilfeldig salt per hemmelighet).

insert into staff_settings (store_lat, store_lng, radius_meters)
select 59.7975, 10.2837, 150
where not exists (select 1 from staff_settings);

insert into staff_point_periods (label, starts_at)
select 'Periode 1', now()
where not exists (select 1 from staff_point_periods where ended_at is null);

insert into staff_members (name, username, email, pin_hash, password_hash, role)
values
  (
    'Mari Haugen', 'mari', null,
    '8d928fe76ff984e1ff19aafa50ce83db:6d83f08b307168f3591219cf79a01938a375ae865ebd5f0313abaa458434262b157b301e8957c149e2a3613e6b793577ab72a8b62a61b33b15d7a67faee4f08b',
    null, 'ansatt'
  ),
  (
    'Jonas Berg', 'jonas', null,
    '3630bcd4fe1fb59737b4e4110828fa7f:0ac3395efcbbc0229f828ccea8d31de25d31cc902ec33db9ae1158e826fbf717bf7f1bbbf2aedc385af5f4e3eaf69db2d49f733c60de4c87e94a6a1bd2538aa5',
    null, 'ansatt'
  ),
  (
    'Silje Nordby', 'silje', 'silje@liertoppen.example',
    'a66c2d75a73deda35e9a4448aaea4626:18f3c28472c1e15ad53ea3d6b2be43fdc577bd65769449fed1278cc5e24b378a208d22bfa0d5330812b06c0a2cb49b635a4fa1d0c4e3603a5a34ded1280f9963',
    'b848deaca22bcc37b6cb8c7b4a30165b:852985e28fd00aec2b6c6f876e849ac8df7de13c434387a379aadaabd0df81879ea9105a89684beac603a71d06ae8af02731a1d3d7df4f0fda9758546477cf9b',
    'leder'
  )
on conflict (username) do nothing;

insert into staff_tasks (title, description, type, points)
values
  ('Åpne butikken', 'Skru på lys, kasse og skjermer, sjekk at alt fungerer.', 'daily', 10),
  ('Rydde i butikken', 'Rydd hyller, tilbehør og prøveutstillinger.', 'daily', 5),
  ('Tell kassebeholdning', 'Tell og loggfør kontantbeholdningen ved stengetid.', 'daily', 10),
  ('Bestille varer for uken', 'Gå gjennom lagerstatus og bestill det som mangler.', 'weekly', 20),
  ('Rengjøre bakrom', 'Grundig rengjøring og opprydding av bakrommet.', 'weekly', 15)
on conflict (title) do nothing;
