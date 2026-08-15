import { MegatoneScraper } from './megatone.scraper';
import { Test } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { AxiosResponse } from 'axios';
import { of, throwError } from 'rxjs';

describe('megatone scraper', () => {
  let megatoneScraper: MegatoneScraper;
  let httpService: HttpService;
  let postMock: jest.Mock;

  const mockResponse: AxiosResponse = {
    data: {
      sku: 'MKT00TLONE',
      precios: {
        web: {
          lista: 4576399.0,
          promocional: 3552999.0,
          neto: 2936362.81,
        },
      },
    },
    status: 200,
    statusText: 'OK',
    headers: {},
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    config: {} as any,
  };

  const sku = 'MKT00TLONE';
  const url = `https://www.megatone.net/producto/iphone-17-pro-256gb-naranja-cosmico_${sku}/`;

  beforeEach(async () => {
    postMock = jest.fn();

    const moduleRef = await Test.createTestingModule({
      providers: [
        MegatoneScraper,
        {
          provide: HttpService,
          useValue: { post: postMock }, // mock manual, no pegamos a la red real
        },
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue('fake-token') },
        },
      ],
    }).compile();

    megatoneScraper = moduleRef.get(MegatoneScraper);
    httpService = moduleRef.get(HttpService);
  });

  it('Debe devolver el precio promocional cuando la respuesta es válida', async () => {
    jest.spyOn(httpService, 'post').mockReturnValue(of(mockResponse));

    const price = await megatoneScraper.getPrice(url);

    expect(price).toBe(3552999.0);
  });

  it('No se puede extraer el SKU', async () => {
    await expect(
      megatoneScraper.getPrice(
        'https://www.megatone.net/producto/algo-sin-SKU',
      ),
    ).rejects.toThrow(
      `No se pudo extraer el sku de la url: https://www.megatone.net/producto/algo-sin-SKU`,
    );
    expect(postMock).not.toHaveBeenCalled();
  });

  it('Precio inválido', async () => {
    mockResponse.data = {};
    jest.spyOn(httpService, 'post').mockReturnValue(of(mockResponse));

    await expect(megatoneScraper.getPrice(url)).rejects.toThrow(
      `Respuesta de Megatone con firma inesperada: sku, precios`,
    );
  });

  it('HTTP Failed', async () => {
    jest
      .spyOn(httpService, 'post')
      .mockReturnValue(throwError(() => new Error('Network timeout')));

    await expect(megatoneScraper.getPrice(url)).rejects.toThrow(
      `Network timeout`,
    );
  });
});
