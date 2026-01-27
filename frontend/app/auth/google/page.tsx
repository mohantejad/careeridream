import { Suspense } from "react";

import GoogleAuthClient from "./GoogleAuthClient";

export const dynamic = "force-dynamic";

const GoogleAuthPage = () => (
  <Suspense fallback={null}>
    <GoogleAuthClient />
  </Suspense>
);

export default GoogleAuthPage;

