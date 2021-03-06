import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import {
  addExpense,
  removeExpense,
  editExpense,
  startAddExpense,
} from '../../actions/expenses';
import expenses from '../fixtures/expenses';

jest.mock('../../firebase/firebase', () => {
  const dbMocker = jest.fn();
  const database = new dbMocker();

  database.ref = jest.fn(reference => ({
    push: jest.fn(data => ({
      then: jest.fn(pushCB => {
        pushCB({key: 'NEWKEY'});
        return {
          then: jest.fn(test => {
            test();
          }),
        };
      }),
    })),
  }));

  return {database};
});

const createMockStore = configureMockStore([thunk]);
const defaultMockState = {
  auth: {uid: 'someid'},
};

test('should setup add expense action obj with provided values', () => {
  const action = addExpense(expenses[2]);
  expect(action).toEqual({
    type: 'ADD_EXPENSE',
    expense: expenses[2],
  });
});

test('should setup edit expense action obj', () => {
  const action = editExpense('123', {note: 'new note!'});
  expect(action).toEqual({
    type: 'EDIT_EXPENSE',
    id: '123',
    values: {note: 'new note!'},
  });
});

test('should setup remove expense action obj', () => {
  const action = removeExpense('123');
  expect(action).toEqual({
    type: 'REMOVE_EXPENSE',
    id: '123',
  });
});

test('should add expense to database and store', done => {
  const store = createMockStore(defaultMockState);

  const data = {
    description: 'test',
    amount: 12345,
    note: 'test note',
    createdAt: 1234,
  };

  store.dispatch(startAddExpense(data)).then(() => {
    const actions = store.getActions();

    expect(actions[0]).toEqual({
      type: 'ADD_EXPENSE',
      expense: {
        id: 'NEWKEY',
        ...data,
      },
    });
    done();
  });
});
