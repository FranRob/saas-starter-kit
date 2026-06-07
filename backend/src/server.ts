import { app } from "./app.js";
import { env } from "./lib/env.js";
import { startDemoResetCron } from "./cron/demo-reset.cron.js";

const PORT = env.PORT;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} [${env.NODE_ENV}]`);
  startDemoResetCron();
});
