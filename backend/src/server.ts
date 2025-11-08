import app from "./app";
import { appConfig } from "./config";

const port = appConfig.port;

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`⚽ Backend service listening on port ${port}`);
});
