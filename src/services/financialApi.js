// Backward-compatibility forwarder to domain module API
import billingApi from '../modules/billing/api/billingApi';

export { billingApi as financialApi };
export default billingApi;
