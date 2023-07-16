import React from 'react';
import { LoadingDialog } from '../../../../_metronic/_partials/controls';
import { useSelector } from 'react-redux';

const ListLoadingDialog = ({reducerName}) => {
    const { isLoading } = useSelector(state => {
        return ({
            isLoading : state[reducerName]?.listLoading
        })
    })
    return <LoadingDialog isLoading={isLoading ?? false} text="Loading..." />;
};

export default ListLoadingDialog;