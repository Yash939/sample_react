import React from 'react';
import { TermsAndConditionsMasterUIProvider } from './TermsAndConditionsMasterUIContext';
import ListLoadingDialog from '../../_commons/components/ListLoadingDialog';
import {reducerInfo} from './_redux/TermsAndConditionsMasterRedux';
import TermsAndConditionsMasterCard from './TermsAndConditionsMasterCard';

const TermsAndCondtionsMasterPage = ({history}) => {
  const uiEvents = {
    newButtonClick: () => {
        history.push(`/settings/masters/terms-and-conditions/master/new`);
    },
    editRecordBtnClick: (id) => {
        history.push(`/settings/masters/terms-and-conditions/master/${id}/edit`);
    },
  }
  return (
    <TermsAndConditionsMasterUIProvider uiEvents={uiEvents}>
      <ListLoadingDialog reducerName={reducerInfo.name} />
      <TermsAndConditionsMasterCard/>
    </TermsAndConditionsMasterUIProvider>
  );
};

export default TermsAndCondtionsMasterPage;