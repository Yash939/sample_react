import { convertFromRaw, EditorState } from "draft-js";
import { Field, Form, Formik } from "formik";
import React, { useEffect } from "react";
import { Modal } from "react-bootstrap";
import { HTMLEditorField } from "../../../../../_metronic/_partials/controls/forms/HTMLEditorField";

const PendingReasonModal = ({
  closeModalHandler,
  values,
  handleSubmit,
  setFieldValue,
  setErrorOnSumit,
  notesType,
}) => {
  const initValue = {
    notes: null,
  };

  return (
    <Modal
      style={{ backgroundColor: "rgba(0,0,0,.3)" }}
      show={true}
      aria-labelledby="contained-modal-title-vcenter"
      centered
      dialogClassName="custom-modal"
    >
      <Formik
        enableReinitialize={true}
        initialValues={initValue}
        onSubmit={(reasonVal) => {
          let val = { ...values };

          if (reasonVal.notes) {
            const editorData = EditorState.createWithContent(
              convertFromRaw(JSON.parse(reasonVal.notes))
            );

            if (editorData.getCurrentContent().getPlainText() !== "") {
              val.notes = reasonVal.notes;

              setFieldValue("notes", reasonVal.notes);
              if (notesType === "Pending") {
                setFieldValue("pending", true);
              } else if (notesType === "Close") {
                setFieldValue("closure", true);
              } else if (notesType === "Cancel") {
                setFieldValue("cancellation", true);
              }
              setErrorOnSumit(true);

              handleSubmit();
              // updateDetailData(val)
              closeModalHandler();
            } else {
              if (notesType === "Pending") {
                alert("Please add Pending Reasons");
              } else if (notesType === "Close") {
                alert("Please Add Closure Note");
              } else if (notesType === "Cancel") {
                alert("Please Add Cancellation Note");
              } else {
                alert("Please Add Note");
              }
            }
          } else {
            if (notesType === "Pending") {
              alert("Please add Pending Reasons");
            } else if (notesType === "Close") {
              alert("Please Add Closure Note");
            } else if (notesType === "Cancel") {
              alert("Please Add Cancellation Note");
            } else {
              alert("Please Add Note");
            }
          }
        }}
      >
        {({ handleSubmit, handleReset, values, setFieldValue }) => (
          <Form>
            <Modal.Header
              closeButton
              className="p-2"
              style={{
                position: "sticky",
                top: 0,
                backgroundColor: "#f7f7f7",
                zIndex: "99999",
              }}
            >
              <>
                <Modal.Title bsPrefix="h6 mt-2">
                  {notesType === "Pending"
                    ? "Pending Reasons"
                    : notesType === "Cancel"
                    ? "Cancellation Note"
                    : notesType === "Close"
                    ? "Closure Note"
                    : notesType === "Confirm"
                    ? "Reason for moving this ticket from confirm to close"
                    : "Notes"}
                </Modal.Title>
              </>
              <button
                type="button"
                className="btn btn-light text-danger col-xs-12 ml-auto"
                onClick={() => closeModalHandler()}
                style={{ fontWeight: "600" }}
              >
                <i
                  className="fa fa-times"
                  aria-hidden="true"
                  style={{ color: "#F64E60" }}
                ></i>
              </button>
            </Modal.Header>

            <Modal.Body>
              <div className="form-group row">
                <div className="col-12">
                  <Field
                    name="notes"
                    component={HTMLEditorField}
                    placeholder="Add your Note here...."
                  />
                </div>
              </div>
            </Modal.Body>

            <Modal.Footer
              className="p-1"
              bsPrefix="text-center modal-footer text-center"
              style={{
                position: "sticky",
                bottom: 0,
                backgroundColor: "#efefef",
                borderTop: "2px solid #ccc",
              }}
            >
              <div className="w-100">
                <button
                  style={{ width: "200px", margin: "0px 10px" }}
                  type="button"
                  className="btn pinaple-black-btn"
                  onClick={() => closeModalHandler()}
                >
                  Cancel
                </button>
                <button
                  style={{ width: "200px", margin: "0px 10px" }}
                  type="submit"
                  className="btn pinaple-yellow-btn "
                  onSubmit={() => handleSubmit()}
                >
                  Save
                </button>
              </div>
            </Modal.Footer>
          </Form>
        )}
      </Formik>
    </Modal>
  );
};

export default PendingReasonModal;
