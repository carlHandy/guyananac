import { Injectable } from '@angular/core';

import { TimeZone } from '@shared/models/time-zone.model';

@Injectable({
  providedIn: 'root',
})
export class TimeZonesService {
  private _timeZones: TimeZone[];
  defaultTimeZoneValue = 'America/New_York';
  constructor() {
    this._timeZones = [
      {
        timezoneLabel: 'Canada/Atlantic',
        timezoneValue: 'Canada/Atlantic',
      },
      {
        timezoneLabel: 'America/Anchorage',
        timezoneValue: 'America/Anchorage',
      },
      {
        timezoneLabel: 'America/Chicago',
        timezoneValue: 'America/Chicago',
      },
      {
        timezoneLabel: 'America/New York',
        timezoneValue: 'America/New_York',
      },
      {
        timezoneLabel: 'Pacific/Honolulu',
        timezoneValue: 'Pacific/Honolulu',
      },
      {
        timezoneLabel: 'America/Denver',
        timezoneValue: 'America/Denver',
      },
      {
        timezoneLabel: 'America/Los Angeles',
        timezoneValue: 'America/Los_Angeles',
      },
    ];
  }

  // return all time zones
  getTimeZones() {
    return this._timeZones;
  }

  // checks if the local time zone array contains a given time zone
  containsTimeZone(timeZoneName: string): boolean {
    const index = this._timeZones.findIndex(
      (t) =>
        t.timezoneValue.toLocaleLowerCase() === timeZoneName.toLocaleLowerCase()
    );
    return index >= 0;
  }
}
