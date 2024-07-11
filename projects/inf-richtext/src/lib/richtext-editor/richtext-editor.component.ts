import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import Editor from 'ckeditor5-custom-build/build/ckeditor'
import {  CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { getUniqueId } from '../utils/unique-id.util';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';



export interface MentionFeedObjectItem {
  id: any;
  text: string;
}

export interface EntityConfig{
  
        searchField: string,
        entityKey: string,
        fullEntityKey: string,
        entityType: {
            code: number,
            ctNumber: number,
            desc:string
        },
        entitySubType: {
            code: number,
            ctNumber: number,
            desc: string
        },
        entitySecondaryType: {
            code: number,
            ctNumber: number,
            desc: string
        },
        originalSystem: {
            code: number,
            ctNumber: number,
            desc: string
        },
        displayEntityDesc: string,
        entityUri: number,
        isActive: boolean
}

@Component({
  selector: 'inf-richtext-editor',
  templateUrl: './richtext-editor.component.html',
  styleUrls: ['./richtext-editor.component.scss'],
  standalone: true,
  imports: [
    CKEditorModule,
    FormsModule,
    HttpClientModule,
    CommonModule 
  ]
})
export class RichtextEditorComponent implements OnInit   {
  id = getUniqueId(1);
  isToolbarHidden : boolean= true;
  isDirty : boolean= false;
  @Input() injectedData : any
  @Input() autoSaveSeconds: number = 3;
  @Input() searchEntitiesUrl: string = ''
  @Output() mentionClick: EventEmitter<MentionFeedObjectItem> = new EventEmitter();
  @Output() sendData : EventEmitter<any> = new EventEmitter<any>();

  @Output() dirtyStateChange: EventEmitter<boolean> = new EventEmitter<boolean>(); // Output event to emit dirty state
  @ViewChild('editor',{static:true}) editorRef!: any;
  Editor: any = Editor;
  isFocus: boolean = false;
  autoSaveTimer: any;
  lastScrollPosition ;


  constructor(private http: HttpClient) {}
  ngOnInit(): void {
 
    this.lastScrollPosition =  window.scrollY || document.documentElement.scrollTop;

   if(!this.injectedData){
      this.injectedData = ''
    }
    if(this.autoSaveSeconds <= 0){
      this.autoSaveSeconds = 3
    }
  }

  onEditorFocusOut(event: any) {
  this.sendData.emit(this.injectedData)
  this.dirtyStateChange.emit(this.isDirty);
  this.isDirty = false;
  this.isFocus = false;
  }
  
  onEditorChange(event: any) {
    this.isDirty = true;
    this.autoSave();
    const scrollPosition =  document.documentElement.scrollTop;
    if(scrollPosition == 0) {
      let stickyPanel =  document.getElementsByClassName('ck-sticky-panel__content') as HTMLCollectionOf<HTMLElement>;
        for (let i = 0; i < stickyPanel.length; i++) {
          let panel = stickyPanel[i];
          panel.style.position = 'fixed';
          panel.style.display = 'block';
          panel.style.bottom = 0 +'px' ;
          panel.style.width = '100%';
          panel.style.background = 'white'
        }
    }
  }

  autoSave():void{
    if(this.autoSaveTimer){
      clearTimeout(this.autoSaveTimer)
    }
      this.autoSaveTimer = setTimeout (()=>{
      this.sendData.emit(this.injectedData)
      this.isDirty = false;
       }, this.autoSaveSeconds * 1000)
  }

  onEditorFocus(event:any){
    this.isFocus = true;
  }
  
  get editorConfig()  {
    return  {
      mention: {
        feeds: [
          {
            marker: '@',
             feed: this.search.bind(this),
             minimumCharacters : 2
        }
        ]
      },
      list: {
        properties: {
            styles: true,
            startIndex: true,
            reversed: true
        },
      },
      placeholder:this.injectedData ? '' : 'הקלד טקסט',
      language: 'he',
    };
  }

  search(queryText: string): Promise<{ id: string; text: string; }[]> {
    const apiUrl = `${this.searchEntitiesUrl}${queryText}`;

    return new Promise<{ id: string; text: string; }[]>((resolve, reject) => {
      this.http.get<EntityConfig[]>(apiUrl)
        .toPromise()
        .then(
          (res: any) => {
            const resultArray: { id: string; text: string; }[] = res.map((item: { displayEntityDesc: string; entityUri: number; }) => ({
              id: `@${item.displayEntityDesc}`,
              text: item.displayEntityDesc, 
              dataId: item.entityUri,
            }));
            resolve(resultArray);
          },
          (error) => {
            if(error.status == 404){
              reject([]);
            }
          }
        );
    });
  }
 
  ngAfterViewChecked() {

    const clientH = document.documentElement.clientHeight
    const scrollPositionH = document.documentElement.scrollHeight
    // check if the editor has scrollable content
    if (scrollPositionH <= clientH) {
      let stickyPanel =  document.getElementsByClassName('ck-sticky-panel__content') as HTMLCollectionOf<HTMLElement>;
      if(stickyPanel.length>0){
        stickyPanel[0].style.cssText = ''; // removes all inline styles
      }
    } 

    let fontTooltipCollection = document.getElementsByClassName('ck ck-dropdown ck-color-ui-dropdown') as HTMLCollectionOf<HTMLElement>;
    if (fontTooltipCollection.length > 0) { // Check if the collection has any elements
      let firstElement = fontTooltipCollection[0]; // This is of type HTMLElement
      if (firstElement.firstChild && firstElement.firstChild instanceof HTMLElement) { // Ensure firstChild is an HTMLElement
        let firstChildElement = firstElement.firstChild as HTMLElement;
        if (firstChildElement.dataset) {
          firstChildElement.dataset['ckeTooltipText'] = ' צבע הדגשת טקסט';   
        }   
      } 
    }
  }

   isScrollAtTop() {
    return window.scrollY <= 0; // Check if scroll position is at or above the top
  }
  
   isScrollAtBottom() {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollPosition = window.scrollY || document.body.scrollTop + (document.documentElement && document.documentElement.scrollTop || 0);
  
    return (documentHeight - scrollPosition) <= windowHeight; // Check if scroll position is at or below the bottom
  }

  @HostListener('window:scroll', ['$event'])
  onWindowScroll() {
    let scrollDirection = '';
    const currentScrollPosition = window.scrollY || document.documentElement.scrollTop;

    if (currentScrollPosition > this.lastScrollPosition) {
      // Scrolling downwards
      scrollDirection = 'down';
    } else if (currentScrollPosition < this.lastScrollPosition) {
      // Scrolling upwards
      scrollDirection = 'up';
    }
    this.lastScrollPosition = currentScrollPosition;

    // if(scrollPosition == 0) {
      let stickyPanel =  document.getElementsByClassName('ck-sticky-panel__content') as HTMLCollectionOf<HTMLElement>;
        for (let i = 0; i < stickyPanel.length; i++) {
          let panel = stickyPanel[i];
          panel.style.position = 'fixed';
          panel.style.background = 'white';
          panel.style.width = '100%';
          panel.style.display = 'block';
          panel.style.marginLeft = 0 + 'px';
          panel.style.height = 'min-content'
          if (this.isScrollAtBottom() || scrollDirection === 'down') {
            // Handle when scroll is at top
            panel.style.top = 0 + 'px';
          } else if ( this.isScrollAtTop() ||scrollDirection === 'up') {
            // Handle when scroll is at bottom
            panel.style.bottom = 0 + 'px';
          }
        }  
    }
  
  @HostListener('click', ['$event']) onClick(_event: MouseEvent) {
    this.isToolbarHidden = false;
  }

  @HostListener('document:click', ['$event']) clickout(_event: MouseEvent) {
  
    if (!this.isToolbarHidden && // toolbar open
      !document.activeElement?.closest(`.editor-${this.id}`)){
      this.isToolbarHidden = true;
    }
  }
  @HostListener('document:MentionCallbackEvent', ['$event'])
  onMentionCallbackEvent(ev: any) {
    this.mentionClick.emit( ev.data.dataId);
  }
}
  




  



 


