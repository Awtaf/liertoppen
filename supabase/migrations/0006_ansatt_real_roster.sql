-- Erstatter de oppdiktede test-ansatte (mari/jonas/silje) med den faktiske
-- ansattgruppen for Telia Liertoppen: Dibran, Amer, Izzedin og Julius som
-- ansatte, og Naser som leder (admin).
--
-- Midlertidige passord ble delt direkte med hver person (ikke committet til
-- git — se lib/staff/pin.ts sin hashSecret() hvis hashene må regenereres).
-- Hashene under er kun det som lar innlogging virke; de avslører ikke
-- passordene. Anbefal at alle bytter PIN/passord under
-- /ansatt/leder/ansatte så snart de har logget inn første gang.

delete from staff_members where username in ('mari', 'jonas', 'silje');

insert into staff_members (name, username, email, pin_hash, password_hash, role)
values
  (
    'Dibran', 'dibran', null, null,
    'f06ea4cb23d4731fd00aa1016b531a33:58a487b95e0656c642ac865faf08081c1a48938a51c50d1cdbde0153f21a6934cc4c2db8e8b9b33722ba9a176ad74d460aaa73055b9ca79ed724bfb954ead6fa',
    'ansatt'
  ),
  (
    'Amer', 'amer', null, null,
    'da7b30bb1b0ad4f8fe26977fb2e9bdca:cb3721e2d8f75a88b8d4c9115786fbce8bdebd175e291bf25a9e3584f4bfc1421f4a7982957fdc003251c2f79825c60de4dafa6b344d846880adf450801a5105',
    'ansatt'
  ),
  (
    'Izzedin', 'izzedin', null, null,
    '9888e89dfe42ecfbe3cf0d7bc3832471:57648129769bffacbef9757953e994d4892a072147e5b8690067612567f684f5c1f75a5f51b73d393a84c4cf9c0efffdd48a31667239afbe125312765f6a0256',
    'ansatt'
  ),
  (
    'Julius', 'julius', null, null,
    '9b3f34b7e170bc757aa9db3013415f7a:fce8608d2261e28d51cb07c4a243719d2a50698fb46ecda4621f410f3cc6e33d4a837cdc6176cec384678442a73edf0fd30e35e22ed97cb8e9924d9b74cab549',
    'ansatt'
  ),
  (
    'Naser', 'naser', null, null,
    '674122c092cb64bd8b1455e92d999684:d4a9c198818a94153d29eae350726c976f33630bfe4068d673e823180bb5c839bc2707e3e3adcf39323b5f104f53e9173b2222364c39315a8abc15d01a14a678',
    'leder'
  )
on conflict (username) do update set
  name = excluded.name,
  email = excluded.email,
  pin_hash = excluded.pin_hash,
  password_hash = excluded.password_hash,
  role = excluded.role,
  active = true;
