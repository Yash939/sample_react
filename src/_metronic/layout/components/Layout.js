import React, { useEffect, useMemo } from "react";
import objectPath from "object-path";
// LayoutContext
import { useHtmlClassService } from "../_core/MetronicLayout";
// Import Layout components
import { HeaderMobile } from "./header-mobile/HeaderMobile";
import { Aside } from "./aside/Aside";
import { Footer } from "./footer/Footer";
import { LayoutInit } from "./LayoutInit";
import { SubHeader } from "./subheader/SubHeader";
import { QuickPanel } from "./extras/offcanvas/QuickPanel";
import { QuickUser } from "./extras/offcanvas/QuickUser";
import { ScrollTop } from "./extras/ScrollTop";
import { StickyToolbar } from "./extras/StickyToolbar";
import { useDispatch } from "react-redux";

export function Layout({ children }) {
    const uiService = useHtmlClassService();
    const dispatch = useDispatch()
    // Layout settings (cssClasses/cssAttributes)
    const layoutProps = useMemo(() => {
        return {
            layoutConfig: uiService.config,
            selfLayout: objectPath.get(uiService.config, "self.layout"),
            asideDisplay: objectPath.get(uiService.config, "aside.self.display"),
            subheaderDisplay: objectPath.get(uiService.config, "subheader.display"),
            stickyToolbarDisplay: objectPath.get(uiService.config, "toolbar.display"),
            desktopHeaderDisplay: objectPath.get(
                uiService.config,
                "header.self.fixed.desktop"
            ),
            contentCssClasses: uiService.getClasses("content", true),
            contentContainerClasses: uiService.getClasses("content_container", true),
            contentExtended: objectPath.get(uiService.config, "content.extended"),
            footerDisplay: objectPath.get(uiService.config, "footer.self.display"),
        };
    }, [uiService]);

    const IDLE_TIME = 15; // in minutes
        let idleTime = null;
        const resetTimer = () => {
            clearTimeout(idleTime);
            idleTime = setTimeout(() => {
                localStorage.removeItem("persist:ticketing-admin-auth");
                window.location.reload()
            }, IDLE_TIME * 1000 * 60);
            // 1000 milliseconds = 1 second
        };

    // useEffect(() => {
    //     // session time out logic
        
    //     let events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart"];
    //     events.forEach(function (name) {
    //         document.addEventListener(name, resetTimer, true);
    //     });
    //     return () => {
    //         events.forEach(function (name) {
    //             document.removeEventListener(name, resetTimer, true);
    //         });
    //     };
    // }, []);

    const eventCheck=()=>{
        // tab 1
        var channel = new BroadcastChannel('tab');
        channel.postMessage('some data');
        resetTimer() 
    }

    useEffect(()=>{
        // tab 2
        var channel = new BroadcastChannel('tab');
        channel.addEventListener('message', function (e) {
            resetTimer()
        });
  
        let events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart"];
        events.forEach(function (name) {
            document.addEventListener(name, eventCheck, true);
        });
    },[])
        
     
    return layoutProps.selfLayout !== "blank" ? (
        <>
            {/*begin::Main*/}
            <HeaderMobile />
            <div className="d-flex flex-column flex-root">
                {/*begin::Page*/}
                <div className="d-flex flex-row flex-column-fluid page">
                    {layoutProps.asideDisplay && (<Aside />)}
                    {/*begin::Wrapper*/}
                    <div className="d-flex flex-column flex-row-fluid wrapper" id="kt_wrapper">
                        {/* <Header/> */}
                        {/*begin::Content*/}
                        <div
                            id="kt_content"
                            className={`content ${layoutProps.contentCssClasses} d-flex flex-column flex-column-fluid`}
                        >
                            {layoutProps.subheaderDisplay && <SubHeader />}
                            {/*begin::Entry*/}
                            {!layoutProps.contentExtended && (
                                <div className="d-flex flex-column-fluid">
                                    {/*begin::Container*/}
                                    <div className={layoutProps.contentContainerClasses}>
                                        {children}
                                    </div>
                                    {/*end::Container*/}
                                </div>
                            )}

                            {layoutProps.contentExtended && { children }}
                            {/*end::Entry*/}
                        </div>
                        {/*end::Content*/}

                        {layoutProps.footerDisplay && <Footer />}
                    </div>
                    {/*end::Wrapper*/}
                </div>
                {/*end::Page*/}
            </div>
            <QuickUser />
            <QuickPanel />
            <ScrollTop />
            {layoutProps.stickyToolbarDisplay && <StickyToolbar />}
            {/*end::Main*/}
            <LayoutInit />
        </>
    ) : (
        // BLANK LAYOUT
        <div className="d-flex flex-column flex-root">{children}</div>
    );
}
