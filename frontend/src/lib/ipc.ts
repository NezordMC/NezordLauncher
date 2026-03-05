export const IPC_EVENTS = {
  APP_LOG_ERROR: "app.log.error",
  INSTANCE_UPDATED: "instance.updated",
  DOWNLOAD_STATUS: "download.status",
  DOWNLOAD_PROGRESS: "download.progress",
  DOWNLOAD_COMPLETE: "download.complete",
  DOWNLOAD_ERROR: "download.error",
  LAUNCH_STATUS: "launch.status",
  LAUNCH_ERROR: "launch.error",
  LAUNCH_GAME_LOG: "launch.game.log",
  LAUNCH_EXIT: "launch.exit",
} as const;

export type IpcEventName = (typeof IPC_EVENTS)[keyof typeof IPC_EVENTS];
