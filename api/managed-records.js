import fetch from '../util/fetch-fill';
import URI from 'urijs';

// /records endpoint
window.path = 'http://localhost:3000/records';

const retrieve = (options = {}) => {
  const { page = 1, colors = [] } = options;
  const pageLimit = 10;
  const primaryColors = ['red', 'yellow', 'blue'];

  const isClosed = record => record.disposition === 'closed';

  const getClosedPrimaryCount = records => records.reduce((count, rec) => {
    return (isClosed(rec) && isPrimary(rec)) ? count + 1 : count;
  }, 0);

  const isPrimary = record => primaryColors.includes(record.color);
  const isOpen = record => record.disposition === 'open';

  const getOpenCount = records => records.filter(isOpen).map(rec => ({ ...rec,
    isPrimary: isPrimary(rec)
  }));

  const nextPageNumber = (records) => {
    return ((records.length - pageLimit) > 0) ? page + 1 : null;
  }

  const previousPageNumber = () => {
    return (page > 1) ? page - 1 : null;
  }

  const getIdsFromRecords = (records) => {
    return records.map(record => record.id);
  }

  const status = res => {
    if(res.status >= 200 && res.status < 300) {
      return Promise.resolve(res)
    } else {
      return Promise.reject(new Error(res.statusText))
    }
  }

  const json = res => res.json();

  const error = err => console.log('Request failed', error);

  return fetch(
    URI(window.path).search({
        'offset': (page - 1) * pageLimit,
        'color[]': colors
    })
  )
  .then(status)
  .then(json)
  .catch(error)
  .then(
    records => {
      const recordsPerPageLimit = records.slice(0, pageLimit);
      return {
        'ids': getIdsFromRecords(recordsPerPageLimit),
        'previousPage': previousPageNumber(),
        'nextPage': nextPageNumber(records),
        'open': getOpenCount(recordsPerPageLimit),
        'closedPrimaryCount': getClosedPrimaryCount(recordsPerPageLimit)
      };
    }
  )
  .catch(
    err => {
      console.log('Request could not be completed: ', err.status, err.statusText);
    }
  )
}

export default retrieve;
