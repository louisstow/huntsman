import fs from "fs";
import path from "path";

type SettingsKeyVal = { [k: string]: any };

declare global {
  namespace NodeJS {
    interface Global {
      HUNTSMAN_SETTINGS: SettingsKeyVal;
    }
  }
}

if (!global.HUNTSMAN_SETTINGS) {
  global.HUNTSMAN_SETTINGS = {};
}

class Settings {
  settings: SettingsKeyVal = {};

  constructor() {
    if (global.HUNTSMAN_SETTINGS) {
      this.extend(global.HUNTSMAN_SETTINGS);
    }
  }

  loadConfig(configPath?: string): boolean {
    const p = configPath || path.resolve(process.cwd(), "hunstman.config.json");
    let config: SettingsKeyVal;

    try {
      config = JSON.parse(fs.readFileSync(p).toString());
    } catch (err) {
      console.log(
        `Unable to read huntsman.config.json in working directory (${p})`
      );

      return false;
    }

    this.extend(config);
    return true;
  }

  get(setting: string, fallback: any = undefined): any {
    return setting in this.settings ? this.settings[setting] : fallback;
  }

  set(setting: string, value: any) {
    this.settings[setting] = value;
  }

  extend(settings: SettingsKeyVal) {
    for (const key in settings) {
      this.set(key, settings[key]);
    }
  }
}

export { Settings };
