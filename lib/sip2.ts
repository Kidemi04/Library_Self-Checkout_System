import { Socket, createConnection } from 'net';

const SIP2_HOST = process.env.SIP2_HOST || 'localhost';
const SIP2_PORT = parseInt(process.env.SIP2_PORT || '6001');
const SIP2_INSTITUTION_ID = process.env.SIP2_INSTITUTION_ID || 'LIB001';
const SIP2_TERMINAL_PASSWORD = process.env.SIP2_TERMINAL_PASSWORD || 'term123';
const SIP2_LOCATION_CODE = process.env.SIP2_LOCATION_CODE || 'MAIN';

if (!SIP2_HOST || !SIP2_PORT) {
  console.warn('[SIP2] Configuration missing. SIP2_HOST and SIP2_PORT are required.');
}

class SIP2Client {
  private socket: Socket | null = null;
  private sequenceNumber = 0;

  private connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket && !this.socket.destroyed) {
        resolve();
        return;
      }

      this.socket = createConnection(SIP2_PORT, SIP2_HOST, () => {
        console.log('[SIP2] Connected to SIP2 server');
        resolve();
      });

      this.socket.on('error', (err) => {
        console.error('[SIP2] Socket error', err);
        reject(err);
      });

      this.socket.on('close', () => {
        console.log('[SIP2] Connection closed');
        this.socket = null;
      });
    });
  }

  private sendMessage(message: string): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        if (!this.socket) {
          await this.connect();
        }

        if (!this.socket) {
          reject(new Error('Failed to connect to SIP2 server'));
          return;
        }

        const fullMessage = message + '\r';

        this.socket.write(fullMessage, 'utf8', (err) => {
          if (err) {
            reject(err);
            return;
          }
        });

      let response = '';
      const onData = (data: Buffer) => {
        response += data.toString('utf8');
        if (response.endsWith('\r')) {
          this.socket!.removeListener('data', onData);
          resolve(response.trim());
        }
      };

      this.socket.on('data', onData);

        // Timeout after 10 seconds
        setTimeout(() => {
          if (this.socket) {
            this.socket.removeListener('data', onData);
          }
          reject(new Error('SIP2 response timeout'));
        }, 10000);
      } catch (err) {
        reject(err);
      }
    });
  }

  private buildMessage(code: string, fields: Record<string, string>): string {
    let msg = code;
    for (const [key, value] of Object.entries(fields)) {
      msg += key + value + '|';
    }
    return msg;
  }

  private parseMessage(msg: string): { code: string; fields: Record<string, string> } {
    const parts = msg.split('|');
    const code = parts[0];
    const fields: Record<string, string> = {};
    for (let i = 1; i < parts.length; i++) {
      const part = parts[i];
      if (part.length >= 2) {
        const key = part.substring(0, 2);
        const value = part.substring(2);
        fields[key] = value;
      }
    }
    return { code, fields };
  }

  private getNextSequence(): string {
    this.sequenceNumber = (this.sequenceNumber + 1) % 1000;
    return this.sequenceNumber.toString().padStart(3, '0');
  }

  async patronInformation(patronId: string, password?: string): Promise<any> {
    const seq = this.getNextSequence();
    const fields: Record<string, string> = {
      AO: SIP2_INSTITUTION_ID,
      AA: patronId,
      AY: seq,
      AC: SIP2_TERMINAL_PASSWORD,
      BP: '1', // Summary: hold items count, overdue items, charged items, fine items, recall items, unavail holds
    };
    if (password) {
      fields.AD = password;
    }

    const message = this.buildMessage('63', fields);
    const response = await this.sendMessage(message);
    const parsed = this.parseMessage(response);

    if (parsed.code !== '64') {
      throw new Error(`Invalid response code: ${parsed.code}`);
    }

    return {
      patronId: parsed.fields.AO,
      name: parsed.fields.AA,
      email: parsed.fields.AE,
      blocked: parsed.fields.BL === 'Y',
      currency: parsed.fields.CQ,
      holdItemsCount: parseInt(parsed.fields.BH || '0'),
      overdueItemsCount: parseInt(parsed.fields.BI || '0'),
      chargedItemsCount: parseInt(parsed.fields.BJ || '0'),
      fineItemsCount: parseInt(parsed.fields.BK || '0'),
      availableHoldsCount: parseInt(parsed.fields.AV || '0'),
      unavailableHoldsCount: parseInt(parsed.fields.BU || '0'),
      screenMessage: parsed.fields.AF,
      printLine: parsed.fields.AG,
      validPatron: parsed.fields.BV === 'Y',
      validPatronPassword: parsed.fields.CC === 'Y',
      ok: parsed.fields.CK === '1',
    };
  }

  async checkout(patronId: string, itemId: string, dueDate?: string, password?: string): Promise<any> {
    const seq = this.getNextSequence();
    const now = new Date();
    const transactionDate = this.formatSipDate(now);
    const nbDueDate = dueDate ? this.formatSipDate(new Date(dueDate)) : '';

    const fields: Record<string, string> = {
      AO: SIP2_INSTITUTION_ID,
      AA: patronId,
      AB: itemId,
      AY: seq,
      AC: SIP2_TERMINAL_PASSWORD,
      CH: 'Web kiosk', // item properties
      CF: transactionDate,
    };

    if (nbDueDate) {
      fields.BT = nbDueDate;
    }

    if (password) {
      fields.AD = password;
    }

    const message = this.buildMessage('11', fields);
    const response = await this.sendMessage(message);
    const parsed = this.parseMessage(response);

    if (parsed.code !== '12') {
      throw new Error(`Invalid response code: ${parsed.code}`);
    }

    return {
      patronId: parsed.fields.AO,
      itemId: parsed.fields.AB,
      title: parsed.fields.AJ,
      dueDate: parsed.fields.AH,
      screenMessage: parsed.fields.AF,
      printLine: parsed.fields.AG,
      ok: parsed.fields.CK === '1',
      renewalOk: parsed.fields.CK === '1',
      magneticMedia: parsed.fields.CM === 'Y',
      desensitize: parsed.fields.CR === 'Y',
      resensitize: parsed.fields.CS === 'Y',
    };
  }

  async checkin(itemId: string, currentLocation?: string, password?: string): Promise<any> {
    const seq = this.getNextSequence();
    const now = new Date();
    const returnDate = this.formatSipDate(now);

    const fields: Record<string, string> = {
      AB: itemId,
      AY: seq,
      AP: currentLocation || SIP2_LOCATION_CODE,
      AO: SIP2_INSTITUTION_ID,
      AC: SIP2_TERMINAL_PASSWORD,
      CF: returnDate,
      CH: 'Web kiosk',
    };

    if (password) {
      fields.AD = password;
    }

    const message = this.buildMessage('09', fields);
    const response = await this.sendMessage(message);
    const parsed = this.parseMessage(response);

    if (parsed.code !== '10') {
      throw new Error(`Invalid response code: ${parsed.code}`);
    }

    return {
      itemId: parsed.fields.AB,
      permanentLocation: parsed.fields.AQ,
      title: parsed.fields.AJ,
      screenMessage: parsed.fields.AF,
      printLine: parsed.fields.AG,
      ok: parsed.fields.CK === '1',
      alert: parsed.fields.CV === 'Y',
      resensitize: parsed.fields.CR === 'Y',
    };
  }

  async itemInformation(itemId: string): Promise<any> {
    const seq = this.getNextSequence();

    const fields: Record<string, string> = {
      AB: itemId,
      AY: seq,
      AO: SIP2_INSTITUTION_ID,
    };

    const message = this.buildMessage('17', fields);
    const response = await this.sendMessage(message);
    const parsed = this.parseMessage(response);

    if (parsed.code !== '18') {
      throw new Error(`Invalid response code: ${parsed.code}`);
    }

    return {
      itemId: parsed.fields.AB,
      title: parsed.fields.AJ,
      dueDate: parsed.fields.DB,
      holdPickupDate: parsed.fields.DF,
      circulate: parsed.fields.CF === 'Y',
      holdQueueLength: parseInt(parsed.fields.BG || '0'),
      screenMessage: parsed.fields.AF,
      printLine: parsed.fields.AG,
      blocked: parsed.fields.BL === 'Y',
      shelvingLocation: parsed.fields.AQ,
      feeAmount: parsed.fields.CS,
      feeType: parsed.fields.CR,
      alert: parsed.fields.CV === 'Y',
      ok: parsed.fields.CK === '1',
    };
  }

  async endPatronSession(patronId: string, password?: string): Promise<any> {
    const seq = this.getNextSequence();

    const fields: Record<string, string> = {
      AO: SIP2_INSTITUTION_ID,
      AA: patronId,
      AY: seq,
      AC: SIP2_TERMINAL_PASSWORD,
    };

    if (password) {
      fields.AD = password;
    }

    const message = this.buildMessage('35', fields);
    const response = await this.sendMessage(message);
    const parsed = this.parseMessage(response);

    if (parsed.code !== '36') {
      throw new Error(`Invalid response code: ${parsed.code}`);
    }

    return {
      patronId: parsed.fields.AO,
      screenMessage: parsed.fields.AF,
      printLine: parsed.fields.AG,
      ok: parsed.fields.CK === '1',
    };
  }

  private formatSipDate(date: Date): string {
    const yyyy = date.getFullYear();
    const mm = (date.getMonth() + 1).toString().padStart(2, '0');
    const dd = date.getDate().toString().padStart(2, '0');
    const hh = date.getHours().toString().padStart(2, '0');
    const min = date.getMinutes().toString().padStart(2, '0');
    const ss = date.getSeconds().toString().padStart(2, '0');

    const offsetMinutes = -date.getTimezoneOffset();
    const abs = Math.abs(offsetMinutes);
    const zzzz = Math.floor(abs / 60).toString().padStart(2, '0') + (abs % 60).toString().padStart(2, '0');

    return `${yyyy}${mm}${dd}${zzzz}${hh}${min}${ss}`;
  }

  close() {
    if (this.socket) {
      this.socket.end();
      this.socket = null;
    }
  }
}

const sip2Client = new SIP2Client();

// Wrapper functions to match the original API
export async function login(payload: any) {
  if (!SIP2_HOST || !SIP2_PORT) {
    throw new Error('SIP2 service unavailable.');
  }

  const patronId = payload.patronIdentifier || payload.patronId;
  const password = payload.patronPassword || payload.password;

  if (!patronId) {
    throw new Error('Patron identifier required');
  }

  return await sip2Client.patronInformation(patronId, password);
}

export async function logout(payload: any) {
  if (!SIP2_HOST || !SIP2_PORT) {
    throw new Error('SIP2 service unavailable.');
  }

  const patronId = payload.patronIdentifier || payload.patronId;
  const password = payload.patronPassword || payload.password;

  if (!patronId) {
    throw new Error('Patron identifier required');
  }

  return await sip2Client.endPatronSession(patronId, password);
}

export async function checkOut(payload: any) {
  if (!SIP2_HOST || !SIP2_PORT) {
    throw new Error('SIP2 service unavailable.');
  }

  const patronId = payload.patronIdentifier;
  const itemId = payload.itemIdentifier;
  const dueDate = payload.nbDueDate || payload.dueDate;
  const password = payload.patronPassword;

  if (!patronId || !itemId) {
    throw new Error('Patron identifier and item identifier required');
  }

  return await sip2Client.checkout(patronId, itemId, dueDate, password);
}

export async function checkIn(payload: any) {
  if (!SIP2_HOST || !SIP2_PORT) {
    throw new Error('SIP2 service unavailable.');
  }

  const itemId = payload.itemIdentifier;
  const currentLocation = payload.currentLocation;
  const password = payload.patronPassword;

  if (!itemId) {
    throw new Error('Item identifier required');
  }

  return await sip2Client.checkin(itemId, currentLocation, password);
}

export async function item(payload: any) {
  if (!SIP2_HOST || !SIP2_PORT) {
    throw new Error('SIP2 service unavailable.');
  }

  const itemId = payload.itemIdentifier;

  if (!itemId) {
    throw new Error('Item identifier required');
  }

  return await sip2Client.itemInformation(itemId);
}