# Vehicle photos

Place real photos of the fleet here, for example:

- `maxus-e-deliver.jpg`
- `mercedes-benz-sprinter.jpg`

Once added, set the `image` field for the matching vehicle in
`data/vehicles.ts` to the file path (e.g.
`/images/fleet/maxus-e-deliver.jpg`). `components/Fleet.tsx` will
automatically render the photo with `next/image` instead of the
illustrated placeholder.
