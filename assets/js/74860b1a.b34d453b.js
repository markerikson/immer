"use strict";(self.webpackChunkimmer_website=self.webpackChunkimmer_website||[]).push([[133],{3905:(e,t,r)=>{r.d(t,{Zo:()=>p,kt:()=>f});var n=r(7294);function a(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function o(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function i(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?o(Object(r),!0).forEach((function(t){a(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):o(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function s(e,t){if(null==e)return{};var r,n,a=function(e,t){if(null==e)return{};var r,n,a={},o=Object.keys(e);for(n=0;n<o.length;n++)r=o[n],t.indexOf(r)>=0||(a[r]=e[r]);return a}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(n=0;n<o.length;n++)r=o[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(a[r]=e[r])}return a}var l=n.createContext({}),d=function(e){var t=n.useContext(l),r=t;return e&&(r="function"==typeof e?e(t):i(i({},t),e)),r},p=function(e){var t=d(e.components);return n.createElement(l.Provider,{value:t},e.children)},u="mdxType",c={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},m=n.forwardRef((function(e,t){var r=e.components,a=e.mdxType,o=e.originalType,l=e.parentName,p=s(e,["components","mdxType","originalType","parentName"]),u=d(r),m=a,f=u["".concat(l,".").concat(m)]||u[m]||c[m]||o;return r?n.createElement(f,i(i({ref:t},p),{},{components:r})):n.createElement(f,i({ref:t},p))}));function f(e,t){var r=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var o=r.length,i=new Array(o);i[0]=m;var s={};for(var l in t)hasOwnProperty.call(t,l)&&(s[l]=t[l]);s.originalType=e,s[u]="string"==typeof e?e:a,i[1]=s;for(var d=2;d<o;d++)i[d]=r[d];return n.createElement.apply(null,i)}return n.createElement.apply(null,r)}m.displayName="MDXCreateElement"},6333:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>p,contentTitle:()=>l,default:()=>m,frontMatter:()=>s,metadata:()=>d,toc:()=>u});var n=r(3117),a=r(102),o=(r(7294),r(3905)),i=["components"],s={id:"pitfalls",title:"Pitfalls"},l=void 0,d={unversionedId:"pitfalls",id:"pitfalls",title:"Pitfalls",description:"Performance tips",source:"@site/docs/pitfalls.md",sourceDirName:".",slug:"/pitfalls",permalink:"/immer/pitfalls",draft:!1,editUrl:"https://github.com/immerjs/immer/edit/main/website/docs/pitfalls.md",tags:[],version:"current",frontMatter:{id:"pitfalls",title:"Pitfalls"},sidebar:"Immer",previous:{title:"FAQ",permalink:"/immer/faq"},next:{title:"Built with Immer",permalink:"/immer/built-with"}},p={},u=[{value:"Performance tips",id:"performance-tips",level:3},{value:"Don&#39;t reassign the recipe argument",id:"dont-reassign-the-recipe-argument",level:3},{value:"Immer only supports unidirectional trees",id:"immer-only-supports-unidirectional-trees",level:3},{value:"Never explicitly return <code>undefined</code> from a producer",id:"never-explicitly-return-undefined-from-a-producer",level:3},{value:"Don&#39;t mutate exotic objects",id:"dont-mutate-exotic-objects",level:3},{value:"Classes should be made draftable or not mutated",id:"classes-should-be-made-draftable-or-not-mutated",level:3},{value:"Only valid indices and length can be mutated on Arrays",id:"only-valid-indices-and-length-can-be-mutated-on-arrays",level:3},{value:"Data not originating from the state will never be drafted",id:"data-not-originating-from-the-state-will-never-be-drafted",level:3},{value:"Immer patches are not necessarily optimal",id:"immer-patches-are-not-necessarily-optimal",level:3},{value:"Always use the result of nested producers",id:"always-use-the-result-of-nested-producers",level:3},{value:"Drafts aren&#39;t referentially equal",id:"drafts-arent-referentially-equal",level:3}],c={toc:u};function m(e){var t=e.components,r=(0,a.Z)(e,i);return(0,o.kt)("wrapper",(0,n.Z)({},c,r,{components:t,mdxType:"MDXLayout"}),(0,o.kt)("center",null,(0,o.kt)("div",{"data-ea-publisher":"immerjs","data-ea-type":"image",className:"horizontal bordered"})),(0,o.kt)("h3",{id:"performance-tips"},"Performance tips"),(0,o.kt)("p",null,"For performance tips, see ",(0,o.kt)("a",{parentName:"p",href:"/immer/performance#performance-tips"},"Performance Tips"),"."),(0,o.kt)("h3",{id:"dont-reassign-the-recipe-argument"},"Don't reassign the recipe argument"),(0,o.kt)("p",null,"Never reassign the ",(0,o.kt)("inlineCode",{parentName:"p"},"draft")," argument (example: ",(0,o.kt)("inlineCode",{parentName:"p"},"draft = myCoolNewState"),"). Instead, either modify the ",(0,o.kt)("inlineCode",{parentName:"p"},"draft")," or return a new state. See ",(0,o.kt)("a",{parentName:"p",href:"/immer/return"},"Returning data from producers"),"."),(0,o.kt)("h3",{id:"immer-only-supports-unidirectional-trees"},"Immer only supports unidirectional trees"),(0,o.kt)("p",null,"Immer assumes your state to be a unidirectional tree. That is, no object should appear twice in the tree, there should be no circular references. There should be exactly one path from the root to any node of the tree."),(0,o.kt)("h3",{id:"never-explicitly-return-undefined-from-a-producer"},"Never explicitly return ",(0,o.kt)("inlineCode",{parentName:"h3"},"undefined")," from a producer"),(0,o.kt)("p",null,"It is possible to return values from producers, except, it is not possible to return ",(0,o.kt)("inlineCode",{parentName:"p"},"undefined")," that way, as it is indistinguishable from not updating the draft at all! If you want to replace the draft with ",(0,o.kt)("inlineCode",{parentName:"p"},"undefined"),", just return ",(0,o.kt)("inlineCode",{parentName:"p"},"nothing")," from the producer."),(0,o.kt)("h3",{id:"dont-mutate-exotic-objects"},"Don't mutate exotic objects"),(0,o.kt)("p",null,"Immer ",(0,o.kt)("a",{parentName:"p",href:"https://github.com/immerjs/immer/issues/504"},"does not support exotic objects")," such as window.location."),(0,o.kt)("h3",{id:"classes-should-be-made-draftable-or-not-mutated"},"Classes should be made draftable or not mutated"),(0,o.kt)("p",null,"You will need to enable your own classes to work properly with Immer. For docs on the topic, check out the section on ",(0,o.kt)("a",{parentName:"p",href:"/immer/complex-objects"},"working with complex objects"),"."),(0,o.kt)("h3",{id:"only-valid-indices-and-length-can-be-mutated-on-arrays"},"Only valid indices and length can be mutated on Arrays"),(0,o.kt)("p",null,"For arrays, only numeric properties and the ",(0,o.kt)("inlineCode",{parentName:"p"},"length")," property can be mutated. Custom properties are not preserved on arrays."),(0,o.kt)("h3",{id:"data-not-originating-from-the-state-will-never-be-drafted"},"Data not originating from the state will never be drafted"),(0,o.kt)("p",null,"Note that data that comes from the closure, and not from the base state, will never be drafted, even when the data has become part of the new draft."),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-javascript"},"function onReceiveTodo(todo) {\n    const nextTodos = produce(todos, draft => {\n        draft.todos[todo.id] = todo\n        // Note, because 'todo' is coming from external, and not from the 'draft',\n        // it isn't draft so the following modification affects the original todo!\n        draft.todos[todo.id].done = true\n\n        // The reason for this, is that it means that the behavior of the 2 lines above\n        // is equivalent to code, making this whole process more consistent\n        todo.done = true\n        draft.todos[todo.id] = todo\n    })\n}\n")),(0,o.kt)("h3",{id:"immer-patches-are-not-necessarily-optimal"},"Immer patches are not necessarily optimal"),(0,o.kt)("p",null,"The set of patches generated by Immer should be correct, that is, applying them to an equal base object should result in the same end state. However Immer does not guarantee the generated set of patches will be optimal, that is, the minimum set of patches possible."),(0,o.kt)("h3",{id:"always-use-the-result-of-nested-producers"},"Always use the result of nested producers"),(0,o.kt)("p",null,"Nested ",(0,o.kt)("inlineCode",{parentName:"p"},"produce")," calls are supported, but note that ",(0,o.kt)("inlineCode",{parentName:"p"},"produce")," will ",(0,o.kt)("em",{parentName:"p"},"always")," produce a new state, so even when passing a draft to a nested produce, the changes made by the inner produce won't be visible in the draft that was passed it, but only in the output that is produced. In other words, when using nested produce, you get a draft of a draft and the result of the inner produce should be merged back into the original draft (or returned). For example ",(0,o.kt)("inlineCode",{parentName:"p"},'produce(state, draft => { produce(draft.user, userDraft => { userDraft.name += "!" })})')," won't work as the output if the inner produce isn't used. The correct way to use nested producers is:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-javascript"},'produce(state, draft => {\n    draft.user = produce(draft.user, userDraft => {\n        userDraft.name += "!"\n    })\n})\n')),(0,o.kt)("h3",{id:"drafts-arent-referentially-equal"},"Drafts aren't referentially equal"),(0,o.kt)("p",null,"Draft objects in Immer are wrapped in ",(0,o.kt)("inlineCode",{parentName:"p"},"Proxy"),", so you cannot use ",(0,o.kt)("inlineCode",{parentName:"p"},"==")," or ",(0,o.kt)("inlineCode",{parentName:"p"},"===")," to test equality between an original object and its equivalent draft (eg. when matching a specific element in an array). Instead, you can use the ",(0,o.kt)("inlineCode",{parentName:"p"},"original")," helper:"),(0,o.kt)("pre",null,(0,o.kt)("code",{parentName:"pre",className:"language-javascript"},"const remove = produce((list, element) => {\n    const index = list.indexOf(element) // this won't work!\n    const index = original(list).indexOf(element) // do this instead\n    if (index > -1) list.splice(index, 1)\n})\n\nconst values = [a, b, c]\nremove(values, a)\n")),(0,o.kt)("p",null,"If possible, it's recommended to perform the comparison outside the ",(0,o.kt)("inlineCode",{parentName:"p"},"produce")," function, or to use a unique identifier property like ",(0,o.kt)("inlineCode",{parentName:"p"},".id")," instead, to avoid needing to use ",(0,o.kt)("inlineCode",{parentName:"p"},"original"),"."))}m.isMDXComponent=!0}}]);