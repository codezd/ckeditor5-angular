/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CKEditorComponent } from './ckeditor.component';
import * as ClassicEditorBuild from '@ckeditor/ckeditor5-build-classic';

describe( 'CKEditorComponent', () => {
	let component: CKEditorComponent;
	let fixture: ComponentFixture<CKEditorComponent>;

	beforeEach( async( () => {
		TestBed.configureTestingModule( {
			declarations: [ CKEditorComponent ]
		} )
			.compileComponents();
	} ) );

	beforeEach( () => {
		fixture = TestBed.createComponent( CKEditorComponent );
		component = fixture.componentInstance;
		component.editor = ClassicEditorBuild;
	} );

	afterEach( () => {
		fixture.destroy();
	} );

	it( 'should create', () => {
		expect( component ).toBeTruthy();
	} );

	describe( 'disabled state', () => {
		it( 'simple usage', () => {
			fixture.detectChanges();

			return wait().then( () => {
				expect( component.disabled ).toBeFalsy();
				expect( component.editorInstance!.isReadOnly ).toBeFalsy();

				component.disabled = true;

				expect( component.disabled ).toBeTruthy();
				expect( component.editorInstance!.isReadOnly ).toBeTruthy();

				component.disabled = false;

				expect( component.disabled ).toBeFalsy();
				expect( component.editorInstance!.isReadOnly ).toBeFalsy();
			} );
		} );

		it( 'editor disabled by the ControlValueAccessor', () => {
			fixture.detectChanges();
			component.setDisabledState( true );

			return wait().then( () => {
				expect( component.disabled ).toBeTruthy();
				expect( component.editorInstance!.isReadOnly ).toBeTruthy();
			} );
		} );
	} );

	describe( 'tagName', () => {
		it( 'should enable creating component on textarea element', () => {
			component.tagName = 'textarea';
			fixture.detectChanges();

			expect( fixture.nativeElement.lastChild.tagName ).toEqual( 'TEXTAREA' );
		} );
	} );

	describe( 'component data', () => {
		it( 'initial data should be empty', () => {
			fixture.detectChanges();

			return wait().then( () => {
				expect( component.data ).toEqual( '' );
				expect( component.editorInstance!.getData() ).toEqual( '<p>&nbsp;</p>' );
			} );
		} );

		it( 'should be configurable at the start of the component', () => {
			fixture.detectChanges();
			component.data = 'foo';

			return wait().then( () => {
				expect( component.data ).toEqual( 'foo' );
				expect( component.editorInstance!.getData() ).toEqual( '<p>foo</p>' );
			} );
		} );

		it( 'should be writeable by ControlValueAccessor', () => {
			fixture.detectChanges();
			component.writeValue( 'foo' );

			return wait().then( () => {
				expect( component.editorInstance!.getData() ).toEqual( '<p>foo</p>' );

				component.writeValue( 'bar' );

				expect( component.editorInstance!.getData() ).toEqual( '<p>bar</p>' );
			} );
		} );
	} );

	describe( 'emitters', () => {
		it( 'ready', () => {
			fixture.detectChanges();
			const spy = jasmine.createSpy();
			component.ready.subscribe( spy );

			return wait().then( () => {
				expect( spy ).toHaveBeenCalledTimes( 1 );
				expect( spy ).toHaveBeenCalledWith( component.editorInstance );
			} );
		} );

		it( 'change', () => {
			fixture.detectChanges();
			const spy = jasmine.createSpy();
			component.change.subscribe( spy );

			return wait().then( () => {
				component.editorInstance!.execute( 'input', { text: 'foo' } );

				expect( spy ).toHaveBeenCalledTimes( 1 );
				expect( spy.calls.first().args[ 0 ].editor ).toEqual( component.editorInstance );
				expect( typeof spy.calls.first().args[ 0 ].event ).toEqual( 'object' );
			} );
		} );

		it( 'focus', () => {
			fixture.detectChanges();
			const spy = jasmine.createSpy();
			component.focus.subscribe( spy );

			return wait().then( () => {
				component.editorInstance!.editing.view.document.fire( 'focus' );

				expect( spy ).toHaveBeenCalledTimes( 1 );
				expect( spy.calls.first().args[ 0 ].editor ).toEqual( component.editorInstance );
				expect( typeof spy.calls.first().args[ 0 ].event ).toEqual( 'object' );
			} );
		} );

		it( 'blur', () => {
			fixture.detectChanges();
			const spy = jasmine.createSpy();
			component.blur.subscribe( spy );

			return wait().then( () => {
				component.editorInstance!.editing.view.focus();

				component.editorInstance!.editing.view.document.fire( 'blur', { target: null } );

				expect( spy ).toHaveBeenCalledTimes( 1 );
				expect( spy.calls.first().args[ 0 ].editor ).toEqual( component.editorInstance );
				expect( typeof spy.calls.first().args[ 0 ].event ).toEqual( 'object' );
			} );
		} );
	} );

	describe( 'control value accessor callbacks', () => {
		it( 'onTouched callback should be called when editor is blurred', () => {
			fixture.detectChanges();

			return wait().then( () => {
				const spy = jasmine.createSpy();

				component.registerOnTouched( spy );
				component.editorInstance!.editing.view.focus();

				component.editorInstance!.editing.view.document.fire( 'blur', { target: null } );

				expect( spy ).toHaveBeenCalled();
			} );
		} );

		it( 'onChange callback should be called when editor model changes', () => {
			fixture.detectChanges();

			return wait().then( () => {
				const spy = jasmine.createSpy();
				component.registerOnChange( spy );

				component.editorInstance!.execute( 'input', { text: 'foo' } );

				expect( spy ).toHaveBeenCalled();
			} );
		} );
	} );
} );

describe( 'CKEditorComponent', () => {
	describe( 'invalid initialization', () => {
		let fixture: ComponentFixture<CKEditorComponent>;
		let component: CKEditorComponent;

		class EditorThatThrowsErrorDuringInitialization {
			static create() {
				return Promise.resolve().then( () => {
					return Promise.reject( new Error() );
				} );
			}
		}

		beforeEach( async( () => {
			TestBed.configureTestingModule( {
				declarations: [ CKEditorComponent ]
			} )
				.compileComponents();
		} ) );

		beforeEach( () => {
			fixture = TestBed.createComponent( CKEditorComponent );
			component = fixture.componentInstance;
			component.editor = EditorThatThrowsErrorDuringInitialization;
		} );

		it( 'should result in error logged to the console', () => {
			const spy = spyOn( console, 'error', );
			fixture.detectChanges();

			return wait().then( () => {
				expect( spy ).toHaveBeenCalled();
			} );
		} );
	} );
} );

function wait( time?: number ) {
	return new Promise( res => {
		setTimeout( res, time );
	} );
}
