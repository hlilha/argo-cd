// @ts-ignore
import { JSONEditor } from "@json-editor/json-editor/dist/jsoneditor.js";
import * as React from "react";
import * as ReactForm from 'react-form';
require('./JsonForm.scss');

export const JsonForm: <E, T extends ReactForm.FieldProps & { className?: string}>(
    props: React.Props<E> & {
        schema: any
    },
) => React.ReactElement<E> = (props)  => {
    React.useEffect(()=> {
        const { schema } = props;
        const element = document.getElementById('editor_holder');
        const options = {
            schema,
            disable_edit_json: true,
            disable_properties: true,
            disable_collapse: false,
            compact: true
        };
        new JSONEditor(element, options);
    });
  return (
    <div id="editor_holder" className="json-editor" />
  );
} 