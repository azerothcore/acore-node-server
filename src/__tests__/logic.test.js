import {DataLoader} from '@yield-insight/servicemodule';
import {dummyQuery, dummyMutation, dummyDL} from '$this/src/logic';

test('dummyQuery returns { value: "dummy" }', async () => {
  expect(await dummyQuery([])).toStrictEqual({value: 'dummy'});
});

test('dummyMutation returns { value: "dummy" }', async () => {
  expect(await dummyMutation()).toStrictEqual({value: 'dummy'});
});

test('dummyDL returns DataLoader', async () => {
  expect(dummyDL(null)).toBeInstanceOf(DataLoader);
});
