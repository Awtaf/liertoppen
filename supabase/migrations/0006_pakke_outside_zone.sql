-- Østfold Bud Service — Pakkelevering utenfor de to definerte sonene.
--
-- Tidligere ble en adresse utenfor Oslo/Lillestrøm og Kløfta/Jessheim/
-- Neskollen avvist helt. Nå prises den i stedet til Kløfta/Jessheim/
-- Neskollen-prisen pluss dette tillegget (redigerbart i /admin/priser).
update services
set config = config || '{"outsideZoneExtraCharge": 200}'::jsonb
where key = 'PAKKE';
