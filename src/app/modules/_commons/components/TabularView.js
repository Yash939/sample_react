import React, { useEffect, useState } from 'react';

const TabularView = ({ tabs = [], style = {}, onTabChange = undefined, forceCurrentTab = undefined }) => {
    tabs = tabs?.filter(x => x !== null)
    const [localTab, selectTab] = useState("")
    const tab = forceCurrentTab ?? localTab
    useEffect(() => {
        if (tabs.length) {
            setTab(tabs[0].key)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        if (tabs.length > 0 && tabs.filter(x => x.key === tab)?.length === 0) {
            setTab(tabs[0].key)
        }
    }, [tabs])

    const setTab = (tabkey) => {
        if (onTabChange)
            onTabChange(tabkey)
        if (forceCurrentTab)
            selectTab(tab)
        else
            selectTab(tabkey)

    }

    const isFirstTab = () => (tabs.length && tab === tabs[0].key)
    const isLastTab = () => {
        if (tabs.length > 1) {
            return tab === tabs[tabs.length - 1].key
        } else {
            return false;
        }
    }

    const handleNextTabClick = () => {
        const currentTab = tabs.find(x => x.key === tab)
        const index = tabs.indexOf(currentTab)
        setTab(tabs[index + 1].key)
    }
    const handlePreviousTabClick = () => {
        const currentTab = tabs.find(x => x.key === tab)
        const index = tabs.indexOf(currentTab)
        setTab(tabs[index - 1].key)
    }

    return (
        <>
            <ul className="nav nav-tabs" role="tablist">
                {
                    tabs.map(x => {
                        return (
                            <li className="nav-item" onClick={x.disabled ? undefined : () => setTab(x.key)} key={x.key}>
                                {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                                <a
                                    className={`nav-link ${x.disabled ? 'disabled' : ''} ${tab === x.key && "active text-warning"}`}
                                    data-toggle="tab"
                                    role="tab"
                                    aria-selected={x.key.toString()}
                                >
                                    {x.title}
                                </a>
                            </li>
                        )
                    })
                }
            </ul>
            <div className="p-5" style={{ border: "1px solid #ddd", borderTopWidth: 0, ...style }}>
                {
                    tabs.map(x => x.key === tab ? <div key={x.key}>{x.content}</div> : null)
                }
                {tabs.length > 1 ? 
                    <div className="d-flex justify-content-between">
                        <button title="Previous Tab" onClick={handlePreviousTabClick} disabled={!tabs.length || isFirstTab()} style={{ padding: '5px 10px', color: "#000" }} className="btn btn-sm btn-light border" type="button"><i className="fa fa-arrow-left"></i></button>
                        <button title="Next Tab" onClick={handleNextTabClick} disabled={!tabs.length || isLastTab()} style={{ padding: '5px 10px', color: "#000" }} className="btn btn-sm btn-light border" type="button"><i className="fa fa-arrow-right"></i></button>
                    </div> 
                    : null
                }
            </div>
        </>
    );
};

export default TabularView;