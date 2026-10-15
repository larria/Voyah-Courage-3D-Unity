/*
 * 2012-4-18
 *
 * 参数: tag:标签<string>,
 *       attr:参数<{id, cls, text, html, src, href, value, css}>
 *
 * 方法: hasClass, addClass, removeClass,
 *       append, appendTo, parent, children[],
 *       click,
 *       css, animation,
 *       remove, clear,
 *       html, text, each,
 */

function $(tag,attr){
    var self={};
    var frame=20
    var queue=[]
    var queueState=true
    if(tag[0]!="#"){
        switch(tag){
            case "body" : self=document.body;break;
            case "head" : self=document.head;break;
            default     : self=document.createElement(tag);
        };
    }else{
        self=document.getElementById(tag.slice(1))
    }
    for(var i in attr||{}){
        var value=attr[i];
        switch(i){
            case "cls"  : self.className=value;break;
            case "text" : self.text(value);break;
            case "html" : self.html(value);break;
            case "css"  : self.css(value);break;
            default     : self[i]=value;
        };
    };
    self.animation=function(param){
        queue.push(function(){
            queueState=false
            var time=param.time || 200
            if(param.attr){
                var attr={}
                for(var i in param.attr){
                    var startValue
                    switch(i){
                        case"width":case"height":case"top":case"left":case"bottom":case"right":
                            var attrName="offset"+i.replace(/(\w)/,function(s){return s.toUpperCase();})
                            startValue=self[attrName];
                            break;
                        case"opacity":
                            startValue=parseInt(self.ownerDocument.defaultView.getComputedStyle(self, null)['opacity'])
                            break;
                        default:
                            var startValue=parseInt(self.style[i].match(/[0-9]*/))
                    }
                    var endValue=param.attr[i]
                    var stepValue=(endValue-startValue)/frame/time*1000
                    attr[i]={start:startValue,end:endValue,step:stepValue,accumulate:startValue}
                }
                var animation=window.setInterval(function(){
                    var cssSetting={}
                    for(var i in attr){
                        attr[i].accumulate+=attr[i].step
                        cssSetting[i]=attr[i].accumulate
                    }
                    self.css(cssSetting)

                },1000/frame)
            }
            window.setTimeout(function(){
                animation && window.clearInterval(animation)
                queue.shift()
                param.callback && param.callback()
                queueState=true
                queue[0] && queue[0]() 
            },time)
        })
        queueState && queue[0]()
    };
    return self;
};

HTMLElement.prototype.css=function(attr){
    for(var stl in attr){
        value=attr[stl];
        switch(typeof value){
            case "string":
                this.style[stl]=value;break;
            case "number":
                if(stl=="zIndex"||stl=="opacity"||value==0){this.style[stl]=value}
                else{this.style[stl]=value+"px";}break;
            case "object":
                var str="";
                for(var i in value){
                    str+=value[i];
                    if(typeof value[i]=="number"&&value[i]!=0){
                        str+="px";
                    };
                    str+=" ";
                };
                this.style[stl]=str;break;
        };
    };
    return this;
};
HTMLElement.prototype.attr=function(attrName,attr){
    if(attr){this.setAttribute(attrName,attr)}
    else{return this.getAttribute(attrName)}
};
HTMLElement.prototype.hasClass=function(cls){
    return this.className.match(new RegExp('(\\s|^)'+cls+'(\\s|)'));
};
HTMLElement.prototype.addClass=function(cls){
    if (!this.hasClass(cls))this.className+=" "+cls;
    return this;
};
HTMLElement.prototype.removeClass=function(cls){
    if (this.hasClass(cls)) {
        var reg = new RegExp('(\\s|^)'+cls+'(\\s|)');
        this.className=this.className.replace(reg,' ');
    }
    return this;
};
HTMLElement.prototype.each=function(fun){
    for(var i=0;i<this.childNodes.length;i++){
        fun.call(this.childNodes[i],i);
    }
    return this;
};
HTMLElement.prototype.append=function(){
    for(var i in arguments){
        this.appendChild(arguments[i]);
    };
    return this;
};
HTMLElement.prototype.appendTo=function(parent){
    this.parentNode.append(this)
    return this;
};
HTMLElement.prototype.parent=function(num){
    if(num>1){
         return this.parentNode.parent(num-1)
    }
    else{return this.parentNode}
};
HTMLElement.prototype.child=function(num){
    if(num){
         return this.children[num]
    }
    else{return this.children}
};
HTMLElement.prototype.remove=function(){
    if(this.parentNode){
        this.parentNode.removeChild(this);
    };
};
HTMLElement.prototype.clear=function(){
    while (this.hasChildNodes()) {
        this.removeChild(this.lastChild);
    }
    return this;
};
HTMLElement.prototype.html=function(str){
    this.innerHTML=str;
    return this;
};
HTMLElement.prototype.text=function(str){
    this.innerHTML= str.replace(/(<[^<>]*>)/g,function($1){return "&lt;"+$1.slice(1,-1)+"&gt;"})
    return this;
};
HTMLElement.prototype.click=function(callback){
    this.addEventListener("click",callback)
    return this;
};
