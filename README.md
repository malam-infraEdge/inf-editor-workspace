# InfEditorWorkspace
This project contains Infraedge's rich text editor.

## Install, build and publish
1. Clone this project.
2. Run `npm install` on the main project folder, in order to install the packager.
3. Run `npm install` in `/projects/inf-richtext` folder in order to install the Richtext editor dependencies.
4. Run `ng build inf-richtext` for building the editor.
5. Navigate to `/dist/inf-richtext` and run `npm publish` in order to publish it to your artificatory.
 
## Usage
Within your angular project, run `npm install inf-richtext`.

## The Components
This library ecxposes standalone components, meaning, the components should be `import`ed into the module/component that is using it.

### InfRichtextComponent
This is the main component which uses the richtext editor.
`import { RichtextEditorWrapperComponent } from 'inf-richtext';`

  <inf-richtext-editor 
  [injectedData]="inputContent"
  [searchEntitiesUrl]="apiUrl"
  (editorFocusout)="emitContent($event)"
  (mentionClick)="printClickedMention($event)">
 </inf-richtext-editor> 


#### Inputs

##### `injectedData: string`

-   **Type**: `string`
-   **Default**: `' '`
-   **Description**:  The injectedData input allows you to pass initial content to the rich text editor component. This content could be HTML, plain text, or any format supported by the editor.

##### `searchEntitiesUrl: string`

-   **Type**: `string`
-   **Default**: `' '`
-   **Description**: This input specifies the URL used for searching entities within the editor (e.g., mentions)..


#### Outputs


##### `editorFocusout: EventEmitter<any>`

-   **Type**: `EventEmitter<any>`
-   **Description**: This output emits an event when the focus is moved out of the editor. It can be used to trigger actions or validations when the editor loses focus. It contains an object describing the content in the editor, along with the data that was initially passed into the editor. Additionally, the dirty state of the editor is also sent along with this event, indicating whether there are unsaved changes.


##### `mentionClick: EventEmitter<InfEditorMentionFeedItem>`

-   **Type**: `EventEmitter<InfEditorMentionFeedItem>`
-   **Description**: This output emits an event when a mention item is clicked within the editor. It provides the clicked `InfEditorMentionFeedItem`, which includes `id` and `text`.


