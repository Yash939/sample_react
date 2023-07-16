import React from 'react'

const NoModulePage = () => {

    return (
        <div className="rounded p-3 " style={{ backgroundColor: "#fff" }}>
            <div class="d-flex align-items-center min-vh-100">
                <div class="container text-center" style={{ fontWeight: '700' }}>
                    <span style={{ color: 'red' }}>Oops!</span> You don't have access to any Modules.
                    <div>
                        Please contact you administrator.
                    </div>
                </div>
            </div>
        </div>
    )
}

export default NoModulePage;