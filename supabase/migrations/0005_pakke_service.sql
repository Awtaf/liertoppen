-- Østfold Bud Service — ny tjeneste: Pakkelevering.
--
-- Enkel, flat prismodell per leveringsadresse (ikke sonebasert startpris
-- som Bud/ekspress, og ikke per-stopp-på-rute som Fast distribusjon):
--   Oslo / Lillestrøm:                     299 kr eks. mva
--   Kløfta / Jessheim / Neskollen:         349 kr eks. mva
--   Inkluderer inntil 15 kg. Over det: 49 kr per ekstra påbegynte 15 kg.
--
-- Postnummer-inndelingen (hvilke steder som hører til hvilken sone) er
-- strukturell logikk i lib/shipments/pricing.ts, ikke noe admin skal endre
-- i hverdagen. Prisene under ER redigerbare i /admin/priser.
insert into services (key, name, description, config, sort_order) values
  (
    'PAKKE',
    'Pakkelevering',
    'Flat pris per leveringsadresse til Oslo/Lillestrøm eller Kløfta/Jessheim/Neskollen. Inkluderer inntil 15 kg, med tillegg per ekstra påbegynte 15 kg.',
    '{"osloLillestromBasePrice": 299, "kloftaJessheimNeskollenBasePrice": 349, "includedWeightKg": 15, "extraWeightTierKg": 15, "extraWeightTierPrice": 49}',
    5
  )
on conflict (key) do nothing;
