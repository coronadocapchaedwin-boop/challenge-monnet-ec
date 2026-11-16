import { test, expect } from '../../fixtures/api.fixture';

test.describe('Posts API', () => {
  test('POST should create a post', async ({ postsClient }) => {
    // ARRANGE (Preparación): Definir los datos de la publicación que se enviará.
    const payload = {
      title: 'Monnet QA Challenge',
      body: 'Playwright TypeScript API testing',
      userId: 1,
    };

    // ACT (Acción): Enviar la solicitud para crear la publicación.
    const { status, body } = await postsClient.create(payload);

    // ASSERT (Validación): Comprobar HTTP 201, los datos enviados y un ID positivo.
    expect(status).toBe(201);
    expect(body).toMatchObject({
      ...payload,
      id: expect.any(Number),
    });
    expect(body.id).toBeGreaterThan(0);
  });

  // DEMOSTRACIÓN: Descomentar este test para provocar un fallo y revisar failure.log en el reporte API.
  /*
  test('Evidencias cuando falla una prueba', async ({ postsClient }) => {
    // ARRANGE (Preparación): Definir una publicación válida.
    const payload = { title: 'Reporte API', body: 'Fallo controlado', userId: 1 };

    // ACT (Acción): Crear la publicación.
    const { status } = await postsClient.create(payload);

    // ASSERT (Validación): Provocar un fallo controlado para revisar el reporte API.
    expect(status).toBe(200);
  });
  */
});
