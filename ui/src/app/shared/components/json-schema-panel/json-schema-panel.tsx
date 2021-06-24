import * as React from 'react';
// @ts-ignore
import { JSONEditor } from "@json-editor/json-editor";
import * as classNames from 'classnames';
import { Consumer, ContextApis } from '../../context';
import { Spinner } from '../spinner';
import { ErrorNotification, NotificationType } from 'argo-ui';

export interface JsonSchemaPanelProps<T> {
    title?: string | React.ReactNode;
    schema: string;
    save?: (input: any) => Promise<any>;
    onModeSwitch?: () => any;
    noReadonlyMode?: boolean;
    parameters? : {name: string, value: string}[]
}

require('../editable-panel/editable-panel.scss');
require('./JsonForm.scss');

interface JsonSchemaPanelState {
    saving: boolean;
    edit: boolean;
    schema: any;
    editor: any;
    value: any;
}
export class JsonSchemaPanel<T = {}> extends React.Component<JsonSchemaPanelProps<T>, JsonSchemaPanelState> {
    
    constructor(props: JsonSchemaPanelProps<T>) {
        super(props);
        const value = this.parseParameters(this.props.parameters);
        this.state = {edit: !!props.noReadonlyMode, saving: false, schema: null, editor: null, value};
    }

    public async componentDidMount() {
        const schema = JSON.parse(this.props.schema);
        const element = document.getElementById('editor_holder');
        const options = {
            schema,
            ajax: true,
            disable_edit_json: true,
            disable_properties: true,
            disable_collapse: false,
            form_name_root: "PARAMETERS",
            iconlib: "fontawesome5",
            show_errors: "change",
            startval: this.state.value,
            no_additional_properties: true,
            required_by_default: true
        };
        const editor = new JSONEditor(element, options);
        editor.disable();

        this.setState({editor, schema});
    }

    private parseParameters(parameters: {name: string, value: string}[]) {
        var obj: {} = {};
        parameters.forEach(param => {
            const parts = param.name.split('.');
            obj = this.parse(obj, parts, 0, param.value);
        });
        return obj;
    }

    private parse(obj: any, parts: string[], index: number, value: string) {
        if (index < parts.length - 1) {
            const subObj = obj.hasOwnProperty(parts[index]) ? obj[parts[index]] : {};
            obj[parts[index]] = this.parse(subObj, parts, index + 1, value);
        } else {
            if (!obj.hasOwnProperty(parts[index])) {
                obj[parts[index]] = value;
            }
        }
        return obj;
    }

    private save(ctx: ContextApis) {
        const error: [] = this.state.editor.validate();
        if(error && error.length) {
            const e=this.formatError(error);
            ctx.notifications.show({
                content: <ErrorNotification title='Unable to save changes' e={e} />,
                type: NotificationType.Error
            })
        } else {
            this.disableEditor();
            this.setState({edit:false});
        }
        const value = this.state.editor.getValue();
        console.log(value);
    }

    private disableEditor() {
        this.state.editor.disable();
    }

    private enableEditor() {
        this.state.editor.enable();
    }

    private formatError(errors: any) {
        var errMessage: string [] = [];
        errors.forEach((err: { path: any; message: any; }) => {
            errMessage.push(`${err.path}: ${err.message}\n`);
        });
        const text = {
            error: errMessage
        }
        return {
            response: {
                text: JSON.stringify(text)
            }
        };
    }

    public render () {
        return (
            <Consumer>
                {ctx => (
                    <div className={classNames('white-box editable-panel', {'editable-panel--disabled': this.state.saving})}>
                        <div className='white-box__details'>
                            {this.props.save && (
                                <div className='editable-panel__buttons'>
                                    {!this.state.edit && (
                                        <button
                                            onClick={() => {
                                                this.setState({edit: true});
                                                this.enableEditor();
                                            }}
                                            className='argo-button argo-button--base'>
                                            Edit
                                        </button>
                                    )}
                                    {this.state.edit && (
                                        <React.Fragment>
                                            <button
                                                disabled={this.state.saving}
                                                onClick={() => !this.state.saving && this.save(ctx)}
                                                className='argo-button argo-button--base'>
                                                <Spinner show={this.state.saving} style={{marginRight: '5px'}} />
                                                Save
                                            </button>{' '}
                                            <button
                                                onClick={() => {
                                                    this.setState({edit: false});
                                                    this.disableEditor();
                                                }}
                                                className='argo-button argo-button--base-o'>
                                                Cancel
                                            </button>
                                        </React.Fragment>
                                    )}
                                </div>
                            )}
                            {this.props.title && <p>{this.props.title}</p>}
                            <div id="editor_holder" className="json-editor" />
                        </div>
                    </div>
                )}
            </Consumer>
        );
    }
}