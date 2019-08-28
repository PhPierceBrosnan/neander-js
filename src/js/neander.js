

const NOP = "NOP";
const STA = "STA";
const LDA = "LDA";
const ADD = "ADD";
const OR = "OR";
const AND = "AND";
const NOT = "NOT";
const JMP = "JMP";
const JN = "JN";
const JZ = "JZ";
const HLT = "HLT";
const DADO = "DADO";
const OPS = [{min: 00, max: 15, name: NOP},
            {min: 16, max: 31, name: STA},
            {min: 32, max: 47, name: LDA},
            {min: 48, max: 63, name: ADD},
            {min: 64, max: 79, name: OR},
            {min: 80, max: 95, name: AND},
            {min: 96, max: 127, name: NOT},
            {min: 128, max: 143, name: JMP},
            {min: 144, max: 159, name: JN},
            {min: 160, max: 239, name: JZ},
            {min: 240, max: 255, name: HLT},];

var code = '';
var ac = 0;
var pc = 0;
var z = true;
var n = false;
var memory_fetches = 0;
var instructions = 0;
var curr_ac;
var bin1;
var fetched_data;
var bin2;
var hex = false;
var dec = true;
var refresh = false;

function changeBase(){
    if(hex){
        hex = false;
        dec = true;
        document.getElementById("baseButton").innerHTML = "Modo Hexadecimal";
    }
    else if(dec){
        hex = true;
        dec = false;
        document.getElementById("baseButton").innerHTML = "Modo Decimal";
    }

    refresh = true;
    changeAdress();
    update(ac, pc, z, n);
    refresh = false;

}

function changeAdress(){

    

    for(i = 0; i <= 255; i++){
        changed(i);
        if(hex){
            document.getElementById(i+"a").innerHTML = i.toString(16);
        }
        if(dec){
            document.getElementById(i+"a").innerHTML = i.toString(10);
        }
    }


    
}

function changed(end){

    let content = document.getElementById(end).value;

    
    
    let i = 0;
    let found = false;
    let is_data = false;

    if(refresh){
        if(content != "0"){
            if(hex){
                content = parseInt(content, 10).toString(16);
            }
            if(dec){
                content = parseInt(content, 16).toString(10);
            }
        }
    }
    

    if(hex){
        contentValue = parseInt(content, 16);
    }
    else{
        contentValue = parseInt(content, 10);
    } 


    if(content.indexOf('v') != -1){
        is_data = true;
    }
    else if(parseInt(end) > 0){
        let before = document.getElementById("m"+(parseInt(end) - 1)).innerHTML;
        if(before == LDA || before == STA || before == JMP || before == JZ || before == JN
          || before == AND || before == OR || before == ADD){
              is_data = true;
          }
    }

    while(i < OPS.length && found == false && is_data == false){
        if((contentValue >= OPS[i].min && contentValue <= OPS[i].max)){
            document.getElementById(end).value = content; 
            document.getElementById("m"+end).innerHTML = OPS[i].name;
            found = true;
        }
        if(content.toString().toUpperCase() == OPS[i].name){
            if(hex){
                document.getElementById(end).value = OPS[i].min.toString(16);
            }
            else{
                document.getElementById(end).value = OPS[i].min;
            }
            document.getElementById("m"+end).innerHTML = OPS[i].name;
            found = true;
        }
        i++;
    }
    if(found == false && is_data == false){
        document.getElementById("m"+end).innerHTML = NOP;
    }
    if(is_data == true){
        document.getElementById("m"+end).innerHTML = "DADO";
        if(refresh){
            document.getElementById(end).value = content;
        }
        
    }
    
    if(document.getElementById(end).value.indexOf("v") != -1){
        document.getElementById(end).value = "v"+parseInt(document.getElementById(end).value.replace("v", ""));
    }
    
}

function start(){
    code  = createCodeArray();
    run();
}

function exportAsJson(){
    let code = createCodeArray();
    document.getElementById('json').value = JSON.stringify(code);
}

function importJson(){
    let code = document.getElementById('json').value;
    console.log(code);
    code = JSON.parse(code);
    for(let i = 0; i < code.length; i++){
        document.getElementById(i+"").value = code[i];
        changed(i);
    }
}

function step(){
    code = createCodeArray();
    ac = ac.toString().replace("v", "");
    
    
    let instruction = translate(code[pc]);
    paint(pc);
    switch(instruction){
        case LDA:
            pc++;
            lda(pc);
            memory_fetches++;
            instructions++;
        break;

        case STA:
            pc++;
            sta(pc);
            memory_fetches++;
            instructions++;
            
        break;

        case HLT:
            instructions++;
        break;

        case JMP:
            pc = fetch(pc + 1) - 1;
            instructions++;
        break;

        case JN:
            if(n){
                pc = fetch(pc + 1) - 1;
                instructions++;
            }
        break;

        case JZ:
            if(z){
                pc = fetch(pc + 1) - 1;
                instructions++;
            }
        break;

        case OR:
            pc++;
            curr_ac = ac.toString();
            bin1 = (+curr_ac).toString(2);
            fetched_data = fetch(fetch(pc)).toString();
            bin2 = (+fetched_data).toString(2);
            ac = or(bin1, bin2);
            instructions++;
        break;

        case NOT:
            curr_ac = ac.toString();
            bin1 = (+curr_ac).toString(2);
            ac = not(bin1);
            instructions++;
        break;

        case AND:
            pc++;
            curr_ac = ac.toString();
            bin1 = (+curr_ac).toString(2);
            fetched_data = fetch(fetch(pc)).toString();
            bin2 = (+fetched_data).toString(2);
            ac = and(bin1, bin2);
            instructions++;
        break;

        case ADD:
            pc++;
            curr_ac = ac;
            fetched_data = fetch(fetch(pc))
            ac = add(parseInt(curr_ac), parseInt(fetched_data));
            instructions++;
        break;
    }
    if(ac > 127){
        n = true;
        z = false;
    }else if(ac == 0){
        z = true;
        n = false;
    }else{
        z = false;
        n = false;
    }
    pc++;
    update(ac, pc, z, n);
}

async function run(){
    
    for(pc = pc; pc < code.length; pc++){
        code = createCodeArray();
        ac = ac.toString().replace("v", "");
        let instruction = translate(code[pc]);
        paint(pc);
        switch(instruction){
            case LDA:
                pc++;
                lda(pc);
                memory_fetches++;
                instructions++;
            break;

            case STA:
                pc++;
                sta(pc);
                memory_fetches++;
                instructions++;
                
            break;

            case HLT:
                pc++;
                instructions++;
                update(ac, pc, z, n);
                return;
            break;

            case JMP:
                pc = fetch(pc + 1) - 1;
                instructions++;
            break;

            case JN:
                if(n){
                    pc = fetch(pc + 1) - 1;
                    instructions++;
                }
            break;

            case JZ:
                if(z){
                    pc = fetch(pc + 1) - 1;
                    instructions++;
                }
            break;

            case OR:
                pc++;
                curr_ac = ac.toString();
                bin1 = (+curr_ac).toString(2);
                fetched_data = fetch(fetch(pc)).toString();
                bin2 = (+fetched_data).toString(2);
                ac = or(bin1, bin2);
                instructions++;
            break;

            case NOT:
                curr_ac = ac.toString();
                bin1 = (+curr_ac).toString(2);
                ac = not(bin1);
                instructions++;
            break;

            case AND:
                pc++;
                curr_ac = ac.toString();
                bin1 = (+curr_ac).toString(2);
                fetched_data = fetch(fetch(pc)).toString();
                bin2 = (+fetched_data).toString(2);
                ac = and(bin1, bin2);
                instructions++;
            break;

            case ADD:
                pc++;
                curr_ac = ac;
                fetched_data = fetch(fetch(pc));

                
                 ac = add(parseInt(curr_ac), parseInt(fetched_data));
                

                
                instructions++;
            break;
        }
        if(ac > 127){
            n = true;
            z = false;
        }else if(ac == 0){
            z = true;
            n = false;
        }else{
            z = false;
            n = false;
        }
        update(ac, pc, z, n);
        await sleep(5);
    }
}

function paint(id){
    for(let i = 0; i < 256; i++){
        document.getElementById(i+"").style.background = "white";
    }
    document.getElementById(id+"").style.background = "yellow";
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function update(ac, pc, z, n){
    let zt = 'black';
    let nt = 'black';
    
    if(hex){
        document.getElementById("ac").innerHTML = parseInt(ac).toString(16);
        

        if(pc == 500){
            
        }else{
    
            document.getElementById("pc").innerHTML = parseInt(pc).toString(16);
            
        }
    }
    if(dec){
        document.getElementById("ac").innerHTML = ac;

        if(pc == 500){
            
        }else{
    
            document.getElementById("pc").innerHTML = pc;
            
        }
    }

    
    if(z){
        zt = 'greenyellow';
    }
    if(n){
        nt = 'greenyellow';
    }
    document.getElementById("z").style.background = zt
    document.getElementById("n").style.background = nt
    //document.getElementById("acessos").innerHTML = memory_fetches
    //document.getElementById("instrucoes").innerHTML = instructions
}


function exportAsAssembly(){
    let code = createCodeArray();
    let out = '';
    for(let i = 0; i < code.length; i++){
        let content = document.getElementById(i).value;
        let content2 = document.getElementById("m"+i).innerHTML;
        if(content.indexOf('v') != -1){
            out += `org ${i}\ndb ${content.replace("v", "")},`;
        }else{
            if(content2 == NOP){
                continue;
            }
            if(content2 == HLT){
                out += `HLT
                ,`;
            }else if(content2 == NOT){
                out += `NOT
                ,`;
            }
            else if(content2 == DADO){
                out += " "+content+`
                ,`;
            }else{
                out += content2;
            }
        }
    }
    let lines = out.split(",");
    out = '';
    for(let i = 0; i < lines.length; i++){
        out += (lines[i].trim())+"\n";
    }
    document.getElementById('json').value = out;
}

function translate(data){
    let i = 0;
    while(i < OPS.length){
        if((data >= OPS[i].min && data <= OPS[i].max) || data.toString().toUpperCase() == OPS[i].name){
            return OPS[i].name;
        }
        i++;
    }
    return NOP;
}

function createCodeArray(){
    let array = [];
    for(let i = 0; i < 256; i++){
        if(hex){
            array.push(parseInt(document.getElementById(i+"").value, 16));
        }
        else{
            array.push(document.getElementById(i+"").value);
        }
        
    }
    return array;
}

function expandByte(data){
    let out = data;
    while(out.length != 8){
        out = "0"+out;
    }
    return out;
}

function not(data){
    let str = expandByte(data).split("");
    let out = '';
    for(let i = 0; i < str.length; i++){
        if(str[i] == '0'){
            out += '1';
        }else{
            out += '0';
        }
    }
    return parseInt(out, 2);
}

function or(current_ac, data){
    let byte1 = expandByte(current_ac).split('');
    let byte2 = expandByte(data).split('');
    let out = '';
    for(let i = 0; i < byte1.length; i++){
        if(byte1[i] == '0' && byte2[i] == '0'){
            out += '0';
        }else{
            out += '1';
        }
    }
    return parseInt(out, 2);
}

function add(ac, data){
    let s_ac = ac;
    let s_data = data;

    let result = (s_ac + s_data).toString();


    result = (+result).toString(2);
    if(result.length < 8){
        return parseInt(expandByte(result), 2);
    }else if(result.length == 8){
        return parseInt(result, 2);
    }else{

        let fragments = result.split('');
        let out = '';
        while(fragments.length > 8){

            fragments.shift();
        }

        for(let i = 0; i < fragments.length; i++){
            out += fragments[i];
        }
        return parseInt(out, 2);
    }
    

}

function and(ac, data){
    let byte1 = expandByte(ac).split('');
    let byte2 = expandByte(data).split('');
    let out = '';
    for(let i = 0; i < byte1.length; i++){
        if(byte1[i] == '1' && byte2[i] == '1'){
            out += '1';
        }else{
            out += '0';
        }
    }
    return parseInt(out, 2);
}

function lda(data){
    

    let temp = document.getElementById(data).value;

    if(hex){
        ac = parseInt(document.getElementById(parseInt(temp, 16).toString()).value, 16);
    }
    else{
        ac = document.getElementById(temp).value;
    }
    
    
    
}

function sta(data){
    

    let temp = document.getElementById(data).value;

    refresh = true;

    if(hex){
        document.getElementById(parseInt(temp, 16).toString()).value = ac;
        changed(parseInt(temp, 16));
    }
    else{
        document.getElementById(temp).value = ac;
        changed(parseInt(temp));
    }

    refresh = false;
    
}

function fetch(data){
    memory_fetches++;
    if(hex){
        return parseInt(document.getElementById(data).value.replace("v", ""), 16);
    }
    else{
        return parseInt(document.getElementById(data).value.replace("v", ""));
    }
   
    
}

function reset(){
    pc = 0;
    ac = 0;
    n = false;
    z = true;
    document.getElementById("n").style.background = "black";
    document.getElementById("z").style.background = "greenyellow";
    document.getElementById("pc").innerHTML = pc;
    document.getElementById("ac").innerHTML = ac;
    paint(pc);
}

window.onkeydown = (evt) => {
    if(evt.keyCode == 113){
        step();
    }else if(evt.keyCode == 115){
        reset();
    }
}

document.write(`<html>
<head>
    <title>neander.js</title>
    <link rel="stylesheet" href="./css/bootstrap.min.css">
    <link rel="stylesheet" href="./css/custom.css">
    <meta name="viewport" content= "width=device-width, initial-scale=1.0"> 
</head>
<body class="bg-light">
    <div class="container bg-light">
        <div class="container-fluid fit">
            <div class="container center little-padding">
                <div class="row">
                    <div class="col">
                        <label class="strong">AC:</label>
                        <div class="display">
                            <label id="ac">0</label>
                        </div>
                    </div>
                    <div class="col">
                            <label class="strong">PC:</label>
                            <div class="display">
                                <label id="pc">0</label>
                            </div>
                        </div>
                </div>
                <br>
                <div class="row">
                    <div class="col">
                        <label class="strong">N:</label>
                        <div class="flag" id="n"></div>
                    </div>
                    <div class="col">
                            <label class="strong">Z:</label>
                            <div class="flag" id="z" style="background: greenyellow"></div>
                    </div>
                </div>
                <br>
                <label>(Para exportar como assembly, o que for varíavel deve iniciar com <strong>v</strong>. Exemplo: v100)</label>
                <br>
                <div class="row">
                    <div class="col">
                        <button onclick="start()" class="btn btn-dark">Rodar<br>Programa</button>
                    </div>
                    <div class="col">
                            <button onclick="step()" class="btn btn-dark">Rodar<BR>Passo(F2)</button>
                    </div>
                    <div class="col">
                            <button onclick="exportAsJson()" class="btn btn-dark">Exportar<br>JSON</button>
                    </div>
                    <div class="col">
                            <button onclick="importJson()" class="btn btn-dark">Importar<BR>JSON</button>
                    </div>
                    <div class="col">
                            <button onclick="exportAsAssembly()" class="btn btn-dark">Exportar<BR>Assembly</button>
                    </div>
                    
                </div>
                <label style="text-decoration: underline; cursor: pointer; color: red" onclick="reset()">Zerar PC/AC/FLAGS(Atalho: F4)</label>
            </div>
            `);
            document.write("<div class='text-center'><button onclick='changeBase()' id='baseButton' style>Modo Hexadecimal</button></div>");
            document.write(`
            
            
        </div>
        <hr>
        <div class="menu" style="display: none">
            <h5>Menu</h5>
            <a href="#inst">Instruções</a>
            <br>
            <a href="#dados">Dados</a>
            
        </div>
        <div class="container">
            <label onclick="mostraEsconde()" style="cursor: pointer;">Mostrar/Esconder área de JSON</label>
            <textarea id="json" style="width: 100%; height: 20vh; display: none" placeholder="Aqui você cola o código em JSON para importar ou recebe o resultado da exportação em JSON ou Assembly"></textarea>
        </div>
        <hr>
        <div class="container">
<div class="row">
<div class="col-md-4 mobile-desktop" style="float: right;">
        <h3 style="text-align: center">Programa</h3>
        <div class="row">
            <div class="col col-border">
                <label>End.</label>
            </div>
            <div class="col col-border">
                <label>Dado</label>
            </div>
            <div class="col col-border">
                <label>Mne.</label>
            </div>
        </div>


        <div class='row' id='inst'><div class='col col-border' id='0a'>0</div><div class='col col-border'><input type='text' value='0' id='0' onchange='changed(0)'></div><div class='col col-border'><label id='m0'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='1a'>1</div><div class='col col-border'><input type='text' value='0' id='1' onchange='changed(1)'></div><div class='col col-border'><label id='m1'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='2a'>2</div><div class='col col-border'><input type='text' value='0' id='2' onchange='changed(2)'></div><div class='col col-border'><label id='m2'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='3a'>3</div><div class='col col-border'><input type='text' value='0' id='3' onchange='changed(3)'></div><div class='col col-border'><label id='m3'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='4a'>4</div><div class='col col-border'><input type='text' value='0' id='4' onchange='changed(4)'></div><div class='col col-border'><label id='m4'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='5a'>5</div><div class='col col-border'><input type='text' value='0' id='5' onchange='changed(5)'></div><div class='col col-border'><label id='m5'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='6a'>6</div><div class='col col-border'><input type='text' value='0' id='6' onchange='changed(6)'></div><div class='col col-border'><label id='m6'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='7a'>7</div><div class='col col-border'><input type='text' value='0' id='7' onchange='changed(7)'></div><div class='col col-border'><label id='m7'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='8a'>8</div><div class='col col-border'><input type='text' value='0' id='8' onchange='changed(8)'></div><div class='col col-border'><label id='m8'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='9a'>9</div><div class='col col-border'><input type='text' value='0' id='9' onchange='changed(9)'></div><div class='col col-border'><label id='m9'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='10a'>10</div><div class='col col-border'><input type='text' value='0' id='10' onchange='changed(10)'></div><div class='col col-border'><label id='m10'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='11a'>11</div><div class='col col-border'><input type='text' value='0' id='11' onchange='changed(11)'></div><div class='col col-border'><label id='m11'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='12a'>12</div><div class='col col-border'><input type='text' value='0' id='12' onchange='changed(12)'></div><div class='col col-border'><label id='m12'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='13a'>13</div><div class='col col-border'><input type='text' value='0' id='13' onchange='changed(13)'></div><div class='col col-border'><label id='m13'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='14a'>14</div><div class='col col-border'><input type='text' value='0' id='14' onchange='changed(14)'></div><div class='col col-border'><label id='m14'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='15a'>15</div><div class='col col-border'><input type='text' value='0' id='15' onchange='changed(15)'></div><div class='col col-border'><label id='m15'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='16a'>16</div><div class='col col-border'><input type='text' value='0' id='16' onchange='changed(16)'></div><div class='col col-border'><label id='m16'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='17a'>17</div><div class='col col-border'><input type='text' value='0' id='17' onchange='changed(17)'></div><div class='col col-border'><label id='m17'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='18a'>18</div><div class='col col-border'><input type='text' value='0' id='18' onchange='changed(18)'></div><div class='col col-border'><label id='m18'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='19a'>19</div><div class='col col-border'><input type='text' value='0' id='19' onchange='changed(19)'></div><div class='col col-border'><label id='m19'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='20a'>20</div><div class='col col-border'><input type='text' value='0' id='20' onchange='changed(20)'></div><div class='col col-border'><label id='m20'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='21a'>21</div><div class='col col-border'><input type='text' value='0' id='21' onchange='changed(21)'></div><div class='col col-border'><label id='m21'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='22a'>22</div><div class='col col-border'><input type='text' value='0' id='22' onchange='changed(22)'></div><div class='col col-border'><label id='m22'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='23a'>23</div><div class='col col-border'><input type='text' value='0' id='23' onchange='changed(23)'></div><div class='col col-border'><label id='m23'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='24a'>24</div><div class='col col-border'><input type='text' value='0' id='24' onchange='changed(24)'></div><div class='col col-border'><label id='m24'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='25a'>25</div><div class='col col-border'><input type='text' value='0' id='25' onchange='changed(25)'></div><div class='col col-border'><label id='m25'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='26a'>26</div><div class='col col-border'><input type='text' value='0' id='26' onchange='changed(26)'></div><div class='col col-border'><label id='m26'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='27a'>27</div><div class='col col-border'><input type='text' value='0' id='27' onchange='changed(27)'></div><div class='col col-border'><label id='m27'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='28a'>28</div><div class='col col-border'><input type='text' value='0' id='28' onchange='changed(28)'></div><div class='col col-border'><label id='m28'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='29a'>29</div><div class='col col-border'><input type='text' value='0' id='29' onchange='changed(29)'></div><div class='col col-border'><label id='m29'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='30a'>30</div><div class='col col-border'><input type='text' value='0' id='30' onchange='changed(30)'></div><div class='col col-border'><label id='m30'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='31a'>31</div><div class='col col-border'><input type='text' value='0' id='31' onchange='changed(31)'></div><div class='col col-border'><label id='m31'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='32a'>32</div><div class='col col-border'><input type='text' value='0' id='32' onchange='changed(32)'></div><div class='col col-border'><label id='m32'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='33a'>33</div><div class='col col-border'><input type='text' value='0' id='33' onchange='changed(33)'></div><div class='col col-border'><label id='m33'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='34a'>34</div><div class='col col-border'><input type='text' value='0' id='34' onchange='changed(34)'></div><div class='col col-border'><label id='m34'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='35a'>35</div><div class='col col-border'><input type='text' value='0' id='35' onchange='changed(35)'></div><div class='col col-border'><label id='m35'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='36a'>36</div><div class='col col-border'><input type='text' value='0' id='36' onchange='changed(36)'></div><div class='col col-border'><label id='m36'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='37a'>37</div><div class='col col-border'><input type='text' value='0' id='37' onchange='changed(37)'></div><div class='col col-border'><label id='m37'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='38a'>38</div><div class='col col-border'><input type='text' value='0' id='38' onchange='changed(38)'></div><div class='col col-border'><label id='m38'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='39a'>39</div><div class='col col-border'><input type='text' value='0' id='39' onchange='changed(39)'></div><div class='col col-border'><label id='m39'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='40a'>40</div><div class='col col-border'><input type='text' value='0' id='40' onchange='changed(40)'></div><div class='col col-border'><label id='m40'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='41a'>41</div><div class='col col-border'><input type='text' value='0' id='41' onchange='changed(41)'></div><div class='col col-border'><label id='m41'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='42a'>42</div><div class='col col-border'><input type='text' value='0' id='42' onchange='changed(42)'></div><div class='col col-border'><label id='m42'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='43a'>43</div><div class='col col-border'><input type='text' value='0' id='43' onchange='changed(43)'></div><div class='col col-border'><label id='m43'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='44a'>44</div><div class='col col-border'><input type='text' value='0' id='44' onchange='changed(44)'></div><div class='col col-border'><label id='m44'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='45a'>45</div><div class='col col-border'><input type='text' value='0' id='45' onchange='changed(45)'></div><div class='col col-border'><label id='m45'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='46a'>46</div><div class='col col-border'><input type='text' value='0' id='46' onchange='changed(46)'></div><div class='col col-border'><label id='m46'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='47a'>47</div><div class='col col-border'><input type='text' value='0' id='47' onchange='changed(47)'></div><div class='col col-border'><label id='m47'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='48a'>48</div><div class='col col-border'><input type='text' value='0' id='48' onchange='changed(48)'></div><div class='col col-border'><label id='m48'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='49a'>49</div><div class='col col-border'><input type='text' value='0' id='49' onchange='changed(49)'></div><div class='col col-border'><label id='m49'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='50a'>50</div><div class='col col-border'><input type='text' value='0' id='50' onchange='changed(50)'></div><div class='col col-border'><label id='m50'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='51a'>51</div><div class='col col-border'><input type='text' value='0' id='51' onchange='changed(51)'></div><div class='col col-border'><label id='m51'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='52a'>52</div><div class='col col-border'><input type='text' value='0' id='52' onchange='changed(52)'></div><div class='col col-border'><label id='m52'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='53a'>53</div><div class='col col-border'><input type='text' value='0' id='53' onchange='changed(53)'></div><div class='col col-border'><label id='m53'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='54a'>54</div><div class='col col-border'><input type='text' value='0' id='54' onchange='changed(54)'></div><div class='col col-border'><label id='m54'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='55a'>55</div><div class='col col-border'><input type='text' value='0' id='55' onchange='changed(55)'></div><div class='col col-border'><label id='m55'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='56a'>56</div><div class='col col-border'><input type='text' value='0' id='56' onchange='changed(56)'></div><div class='col col-border'><label id='m56'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='57a'>57</div><div class='col col-border'><input type='text' value='0' id='57' onchange='changed(57)'></div><div class='col col-border'><label id='m57'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='58a'>58</div><div class='col col-border'><input type='text' value='0' id='58' onchange='changed(58)'></div><div class='col col-border'><label id='m58'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='59a'>59</div><div class='col col-border'><input type='text' value='0' id='59' onchange='changed(59)'></div><div class='col col-border'><label id='m59'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='60a'>60</div><div class='col col-border'><input type='text' value='0' id='60' onchange='changed(60)'></div><div class='col col-border'><label id='m60'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='61a'>61</div><div class='col col-border'><input type='text' value='0' id='61' onchange='changed(61)'></div><div class='col col-border'><label id='m61'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='62a'>62</div><div class='col col-border'><input type='text' value='0' id='62' onchange='changed(62)'></div><div class='col col-border'><label id='m62'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='63a'>63</div><div class='col col-border'><input type='text' value='0' id='63' onchange='changed(63)'></div><div class='col col-border'><label id='m63'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='64a'>64</div><div class='col col-border'><input type='text' value='0' id='64' onchange='changed(64)'></div><div class='col col-border'><label id='m64'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='65a'>65</div><div class='col col-border'><input type='text' value='0' id='65' onchange='changed(65)'></div><div class='col col-border'><label id='m65'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='66a'>66</div><div class='col col-border'><input type='text' value='0' id='66' onchange='changed(66)'></div><div class='col col-border'><label id='m66'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='67a'>67</div><div class='col col-border'><input type='text' value='0' id='67' onchange='changed(67)'></div><div class='col col-border'><label id='m67'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='68a'>68</div><div class='col col-border'><input type='text' value='0' id='68' onchange='changed(68)'></div><div class='col col-border'><label id='m68'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='69a'>69</div><div class='col col-border'><input type='text' value='0' id='69' onchange='changed(69)'></div><div class='col col-border'><label id='m69'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='70a'>70</div><div class='col col-border'><input type='text' value='0' id='70' onchange='changed(70)'></div><div class='col col-border'><label id='m70'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='71a'>71</div><div class='col col-border'><input type='text' value='0' id='71' onchange='changed(71)'></div><div class='col col-border'><label id='m71'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='72a'>72</div><div class='col col-border'><input type='text' value='0' id='72' onchange='changed(72)'></div><div class='col col-border'><label id='m72'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='73a'>73</div><div class='col col-border'><input type='text' value='0' id='73' onchange='changed(73)'></div><div class='col col-border'><label id='m73'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='74a'>74</div><div class='col col-border'><input type='text' value='0' id='74' onchange='changed(74)'></div><div class='col col-border'><label id='m74'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='75a'>75</div><div class='col col-border'><input type='text' value='0' id='75' onchange='changed(75)'></div><div class='col col-border'><label id='m75'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='76a'>76</div><div class='col col-border'><input type='text' value='0' id='76' onchange='changed(76)'></div><div class='col col-border'><label id='m76'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='77a'>77</div><div class='col col-border'><input type='text' value='0' id='77' onchange='changed(77)'></div><div class='col col-border'><label id='m77'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='78a'>78</div><div class='col col-border'><input type='text' value='0' id='78' onchange='changed(78)'></div><div class='col col-border'><label id='m78'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='79a'>79</div><div class='col col-border'><input type='text' value='0' id='79' onchange='changed(79)'></div><div class='col col-border'><label id='m79'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='80a'>80</div><div class='col col-border'><input type='text' value='0' id='80' onchange='changed(80)'></div><div class='col col-border'><label id='m80'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='81a'>81</div><div class='col col-border'><input type='text' value='0' id='81' onchange='changed(81)'></div><div class='col col-border'><label id='m81'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='82a'>82</div><div class='col col-border'><input type='text' value='0' id='82' onchange='changed(82)'></div><div class='col col-border'><label id='m82'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='83a'>83</div><div class='col col-border'><input type='text' value='0' id='83' onchange='changed(83)'></div><div class='col col-border'><label id='m83'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='84a'>84</div><div class='col col-border'><input type='text' value='0' id='84' onchange='changed(84)'></div><div class='col col-border'><label id='m84'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='85a'>85</div><div class='col col-border'><input type='text' value='0' id='85' onchange='changed(85)'></div><div class='col col-border'><label id='m85'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='86a'>86</div><div class='col col-border'><input type='text' value='0' id='86' onchange='changed(86)'></div><div class='col col-border'><label id='m86'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='87a'>87</div><div class='col col-border'><input type='text' value='0' id='87' onchange='changed(87)'></div><div class='col col-border'><label id='m87'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='88a'>88</div><div class='col col-border'><input type='text' value='0' id='88' onchange='changed(88)'></div><div class='col col-border'><label id='m88'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='89a'>89</div><div class='col col-border'><input type='text' value='0' id='89' onchange='changed(89)'></div><div class='col col-border'><label id='m89'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='90a'>90</div><div class='col col-border'><input type='text' value='0' id='90' onchange='changed(90)'></div><div class='col col-border'><label id='m90'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='91a'>91</div><div class='col col-border'><input type='text' value='0' id='91' onchange='changed(91)'></div><div class='col col-border'><label id='m91'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='92a'>92</div><div class='col col-border'><input type='text' value='0' id='92' onchange='changed(92)'></div><div class='col col-border'><label id='m92'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='93a'>93</div><div class='col col-border'><input type='text' value='0' id='93' onchange='changed(93)'></div><div class='col col-border'><label id='m93'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='94a'>94</div><div class='col col-border'><input type='text' value='0' id='94' onchange='changed(94)'></div><div class='col col-border'><label id='m94'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='95a'>95</div><div class='col col-border'><input type='text' value='0' id='95' onchange='changed(95)'></div><div class='col col-border'><label id='m95'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='96a'>96</div><div class='col col-border'><input type='text' value='0' id='96' onchange='changed(96)'></div><div class='col col-border'><label id='m96'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='97a'>97</div><div class='col col-border'><input type='text' value='0' id='97' onchange='changed(97)'></div><div class='col col-border'><label id='m97'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='98a'>98</div><div class='col col-border'><input type='text' value='0' id='98' onchange='changed(98)'></div><div class='col col-border'><label id='m98'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='99a'>99</div><div class='col col-border'><input type='text' value='0' id='99' onchange='changed(99)'></div><div class='col col-border'><label id='m99'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='100a'>100</div><div class='col col-border'><input type='text' value='0' id='100' onchange='changed(100)'></div><div class='col col-border'><label id='m100'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='101a'>101</div><div class='col col-border'><input type='text' value='0' id='101' onchange='changed(101)'></div><div class='col col-border'><label id='m101'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='102a'>102</div><div class='col col-border'><input type='text' value='0' id='102' onchange='changed(102)'></div><div class='col col-border'><label id='m102'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='103a'>103</div><div class='col col-border'><input type='text' value='0' id='103' onchange='changed(103)'></div><div class='col col-border'><label id='m103'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='104a'>104</div><div class='col col-border'><input type='text' value='0' id='104' onchange='changed(104)'></div><div class='col col-border'><label id='m104'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='105a'>105</div><div class='col col-border'><input type='text' value='0' id='105' onchange='changed(105)'></div><div class='col col-border'><label id='m105'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='106a'>106</div><div class='col col-border'><input type='text' value='0' id='106' onchange='changed(106)'></div><div class='col col-border'><label id='m106'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='107a'>107</div><div class='col col-border'><input type='text' value='0' id='107' onchange='changed(107)'></div><div class='col col-border'><label id='m107'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='108a'>108</div><div class='col col-border'><input type='text' value='0' id='108' onchange='changed(108)'></div><div class='col col-border'><label id='m108'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='109a'>109</div><div class='col col-border'><input type='text' value='0' id='109' onchange='changed(109)'></div><div class='col col-border'><label id='m109'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='110a'>110</div><div class='col col-border'><input type='text' value='0' id='110' onchange='changed(110)'></div><div class='col col-border'><label id='m110'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='111a'>111</div><div class='col col-border'><input type='text' value='0' id='111' onchange='changed(111)'></div><div class='col col-border'><label id='m111'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='112a'>112</div><div class='col col-border'><input type='text' value='0' id='112' onchange='changed(112)'></div><div class='col col-border'><label id='m112'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='113a'>113</div><div class='col col-border'><input type='text' value='0' id='113' onchange='changed(113)'></div><div class='col col-border'><label id='m113'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='114a'>114</div><div class='col col-border'><input type='text' value='0' id='114' onchange='changed(114)'></div><div class='col col-border'><label id='m114'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='115a'>115</div><div class='col col-border'><input type='text' value='0' id='115' onchange='changed(115)'></div><div class='col col-border'><label id='m115'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='116a'>116</div><div class='col col-border'><input type='text' value='0' id='116' onchange='changed(116)'></div><div class='col col-border'><label id='m116'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='117a'>117</div><div class='col col-border'><input type='text' value='0' id='117' onchange='changed(117)'></div><div class='col col-border'><label id='m117'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='118a'>118</div><div class='col col-border'><input type='text' value='0' id='118' onchange='changed(118)'></div><div class='col col-border'><label id='m118'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='119a'>119</div><div class='col col-border'><input type='text' value='0' id='119' onchange='changed(119)'></div><div class='col col-border'><label id='m119'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='120a'>120</div><div class='col col-border'><input type='text' value='0' id='120' onchange='changed(120)'></div><div class='col col-border'><label id='m120'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='121a'>121</div><div class='col col-border'><input type='text' value='0' id='121' onchange='changed(121)'></div><div class='col col-border'><label id='m121'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='122a'>122</div><div class='col col-border'><input type='text' value='0' id='122' onchange='changed(122)'></div><div class='col col-border'><label id='m122'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='123a'>123</div><div class='col col-border'><input type='text' value='0' id='123' onchange='changed(123)'></div><div class='col col-border'><label id='m123'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='124a'>124</div><div class='col col-border'><input type='text' value='0' id='124' onchange='changed(124)'></div><div class='col col-border'><label id='m124'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='125a'>125</div><div class='col col-border'><input type='text' value='0' id='125' onchange='changed(125)'></div><div class='col col-border'><label id='m125'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='126a'>126</div><div class='col col-border'><input type='text' value='0' id='126' onchange='changed(126)'></div><div class='col col-border'><label id='m126'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='127a'>127</div><div class='col col-border'><input type='text' value='0' id='127' onchange='changed(127)'></div><div class='col col-border'><label id='m127'>NOP</label></div></div>

</div>
</div>
<div class="col-md-4" style="float: right;">
        <h3 style="text-align: center">Dados</h3>
        <div class="row">
            <div class="col col-border">
                <label>End.</label>
            </div>
            <div class="col col-border">
                <label>Dado</label>
            </div>
            <div class="col col-border">
                <label>Mne.</label>
            </div>
        </div>


        <div class='row' id='inst'><div class='col col-border' id='128a'>128</div><div class='col col-border'><input type='text' value='0' id='128' onchange='changed(128)'></div><div class='col col-border'><label id='m128'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='129a'>129</div><div class='col col-border'><input type='text' value='0' id='129' onchange='changed(129)'></div><div class='col col-border'><label id='m129'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='130a'>130</div><div class='col col-border'><input type='text' value='0' id='130' onchange='changed(130)'></div><div class='col col-border'><label id='m130'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='131a'>131</div><div class='col col-border'><input type='text' value='0' id='131' onchange='changed(131)'></div><div class='col col-border'><label id='m131'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='132a'>132</div><div class='col col-border'><input type='text' value='0' id='132' onchange='changed(132)'></div><div class='col col-border'><label id='m132'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='133a'>133</div><div class='col col-border'><input type='text' value='0' id='133' onchange='changed(133)'></div><div class='col col-border'><label id='m133'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='134a'>134</div><div class='col col-border'><input type='text' value='0' id='134' onchange='changed(134)'></div><div class='col col-border'><label id='m134'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='135a'>135</div><div class='col col-border'><input type='text' value='0' id='135' onchange='changed(135)'></div><div class='col col-border'><label id='m135'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='136a'>136</div><div class='col col-border'><input type='text' value='0' id='136' onchange='changed(136)'></div><div class='col col-border'><label id='m136'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='137a'>137</div><div class='col col-border'><input type='text' value='0' id='137' onchange='changed(137)'></div><div class='col col-border'><label id='m137'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='138a'>138</div><div class='col col-border'><input type='text' value='0' id='138' onchange='changed(138)'></div><div class='col col-border'><label id='m138'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='139a'>139</div><div class='col col-border'><input type='text' value='0' id='139' onchange='changed(139)'></div><div class='col col-border'><label id='m139'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='140a'>140</div><div class='col col-border'><input type='text' value='0' id='140' onchange='changed(140)'></div><div class='col col-border'><label id='m140'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='141a'>141</div><div class='col col-border'><input type='text' value='0' id='141' onchange='changed(141)'></div><div class='col col-border'><label id='m141'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='142a'>142</div><div class='col col-border'><input type='text' value='0' id='142' onchange='changed(142)'></div><div class='col col-border'><label id='m142'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='143a'>143</div><div class='col col-border'><input type='text' value='0' id='143' onchange='changed(143)'></div><div class='col col-border'><label id='m143'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='144a'>144</div><div class='col col-border'><input type='text' value='0' id='144' onchange='changed(144)'></div><div class='col col-border'><label id='m144'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='145a'>145</div><div class='col col-border'><input type='text' value='0' id='145' onchange='changed(145)'></div><div class='col col-border'><label id='m145'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='146a'>146</div><div class='col col-border'><input type='text' value='0' id='146' onchange='changed(146)'></div><div class='col col-border'><label id='m146'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='147a'>147</div><div class='col col-border'><input type='text' value='0' id='147' onchange='changed(147)'></div><div class='col col-border'><label id='m147'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='148a'>148</div><div class='col col-border'><input type='text' value='0' id='148' onchange='changed(148)'></div><div class='col col-border'><label id='m148'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='149a'>149</div><div class='col col-border'><input type='text' value='0' id='149' onchange='changed(149)'></div><div class='col col-border'><label id='m149'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='150a'>150</div><div class='col col-border'><input type='text' value='0' id='150' onchange='changed(150)'></div><div class='col col-border'><label id='m150'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='151a'>151</div><div class='col col-border'><input type='text' value='0' id='151' onchange='changed(151)'></div><div class='col col-border'><label id='m151'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='152a'>152</div><div class='col col-border'><input type='text' value='0' id='152' onchange='changed(152)'></div><div class='col col-border'><label id='m152'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='153a'>153</div><div class='col col-border'><input type='text' value='0' id='153' onchange='changed(153)'></div><div class='col col-border'><label id='m153'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='154a'>154</div><div class='col col-border'><input type='text' value='0' id='154' onchange='changed(154)'></div><div class='col col-border'><label id='m154'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='155a'>155</div><div class='col col-border'><input type='text' value='0' id='155' onchange='changed(155)'></div><div class='col col-border'><label id='m155'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='156a'>156</div><div class='col col-border'><input type='text' value='0' id='156' onchange='changed(156)'></div><div class='col col-border'><label id='m156'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='157a'>157</div><div class='col col-border'><input type='text' value='0' id='157' onchange='changed(157)'></div><div class='col col-border'><label id='m157'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='158a'>158</div><div class='col col-border'><input type='text' value='0' id='158' onchange='changed(158)'></div><div class='col col-border'><label id='m158'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='159a'>159</div><div class='col col-border'><input type='text' value='0' id='159' onchange='changed(159)'></div><div class='col col-border'><label id='m159'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='160a'>160</div><div class='col col-border'><input type='text' value='0' id='160' onchange='changed(160)'></div><div class='col col-border'><label id='m160'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='161a'>161</div><div class='col col-border'><input type='text' value='0' id='161' onchange='changed(161)'></div><div class='col col-border'><label id='m161'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='162a'>162</div><div class='col col-border'><input type='text' value='0' id='162' onchange='changed(162)'></div><div class='col col-border'><label id='m162'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='163a'>163</div><div class='col col-border'><input type='text' value='0' id='163' onchange='changed(163)'></div><div class='col col-border'><label id='m163'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='164a'>164</div><div class='col col-border'><input type='text' value='0' id='164' onchange='changed(164)'></div><div class='col col-border'><label id='m164'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='165a'>165</div><div class='col col-border'><input type='text' value='0' id='165' onchange='changed(165)'></div><div class='col col-border'><label id='m165'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='166a'>166</div><div class='col col-border'><input type='text' value='0' id='166' onchange='changed(166)'></div><div class='col col-border'><label id='m166'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='167a'>167</div><div class='col col-border'><input type='text' value='0' id='167' onchange='changed(167)'></div><div class='col col-border'><label id='m167'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='168a'>168</div><div class='col col-border'><input type='text' value='0' id='168' onchange='changed(168)'></div><div class='col col-border'><label id='m168'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='169a'>169</div><div class='col col-border'><input type='text' value='0' id='169' onchange='changed(169)'></div><div class='col col-border'><label id='m169'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='170a'>170</div><div class='col col-border'><input type='text' value='0' id='170' onchange='changed(170)'></div><div class='col col-border'><label id='m170'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='171a'>171</div><div class='col col-border'><input type='text' value='0' id='171' onchange='changed(171)'></div><div class='col col-border'><label id='m171'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='172a'>172</div><div class='col col-border'><input type='text' value='0' id='172' onchange='changed(172)'></div><div class='col col-border'><label id='m172'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='173a'>173</div><div class='col col-border'><input type='text' value='0' id='173' onchange='changed(173)'></div><div class='col col-border'><label id='m173'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='174a'>174</div><div class='col col-border'><input type='text' value='0' id='174' onchange='changed(174)'></div><div class='col col-border'><label id='m174'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='175a'>175</div><div class='col col-border'><input type='text' value='0' id='175' onchange='changed(175)'></div><div class='col col-border'><label id='m175'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='176a'>176</div><div class='col col-border'><input type='text' value='0' id='176' onchange='changed(176)'></div><div class='col col-border'><label id='m176'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='177a'>177</div><div class='col col-border'><input type='text' value='0' id='177' onchange='changed(177)'></div><div class='col col-border'><label id='m177'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='178a'>178</div><div class='col col-border'><input type='text' value='0' id='178' onchange='changed(178)'></div><div class='col col-border'><label id='m178'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='179a'>179</div><div class='col col-border'><input type='text' value='0' id='179' onchange='changed(179)'></div><div class='col col-border'><label id='m179'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='180a'>180</div><div class='col col-border'><input type='text' value='0' id='180' onchange='changed(180)'></div><div class='col col-border'><label id='m180'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='181a'>181</div><div class='col col-border'><input type='text' value='0' id='181' onchange='changed(181)'></div><div class='col col-border'><label id='m181'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='182a'>182</div><div class='col col-border'><input type='text' value='0' id='182' onchange='changed(182)'></div><div class='col col-border'><label id='m182'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='183a'>183</div><div class='col col-border'><input type='text' value='0' id='183' onchange='changed(183)'></div><div class='col col-border'><label id='m183'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='184a'>184</div><div class='col col-border'><input type='text' value='0' id='184' onchange='changed(184)'></div><div class='col col-border'><label id='m184'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='185a'>185</div><div class='col col-border'><input type='text' value='0' id='185' onchange='changed(185)'></div><div class='col col-border'><label id='m185'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='186a'>186</div><div class='col col-border'><input type='text' value='0' id='186' onchange='changed(186)'></div><div class='col col-border'><label id='m186'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='187a'>187</div><div class='col col-border'><input type='text' value='0' id='187' onchange='changed(187)'></div><div class='col col-border'><label id='m187'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='188a'>188</div><div class='col col-border'><input type='text' value='0' id='188' onchange='changed(188)'></div><div class='col col-border'><label id='m188'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='189a'>189</div><div class='col col-border'><input type='text' value='0' id='189' onchange='changed(189)'></div><div class='col col-border'><label id='m189'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='190a'>190</div><div class='col col-border'><input type='text' value='0' id='190' onchange='changed(190)'></div><div class='col col-border'><label id='m190'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='191a'>191</div><div class='col col-border'><input type='text' value='0' id='191' onchange='changed(191)'></div><div class='col col-border'><label id='m191'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='192a'>192</div><div class='col col-border'><input type='text' value='0' id='192' onchange='changed(192)'></div><div class='col col-border'><label id='m192'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='193a'>193</div><div class='col col-border'><input type='text' value='0' id='193' onchange='changed(193)'></div><div class='col col-border'><label id='m193'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='194a'>194</div><div class='col col-border'><input type='text' value='0' id='194' onchange='changed(194)'></div><div class='col col-border'><label id='m194'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='195a'>195</div><div class='col col-border'><input type='text' value='0' id='195' onchange='changed(195)'></div><div class='col col-border'><label id='m195'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='196a'>196</div><div class='col col-border'><input type='text' value='0' id='196' onchange='changed(196)'></div><div class='col col-border'><label id='m196'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='197a'>197</div><div class='col col-border'><input type='text' value='0' id='197' onchange='changed(197)'></div><div class='col col-border'><label id='m197'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='198a'>198</div><div class='col col-border'><input type='text' value='0' id='198' onchange='changed(198)'></div><div class='col col-border'><label id='m198'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='199a'>199</div><div class='col col-border'><input type='text' value='0' id='199' onchange='changed(199)'></div><div class='col col-border'><label id='m199'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='200a'>200</div><div class='col col-border'><input type='text' value='0' id='200' onchange='changed(200)'></div><div class='col col-border'><label id='m200'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='201a'>201</div><div class='col col-border'><input type='text' value='0' id='201' onchange='changed(201)'></div><div class='col col-border'><label id='m201'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='202a'>202</div><div class='col col-border'><input type='text' value='0' id='202' onchange='changed(202)'></div><div class='col col-border'><label id='m202'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='203a'>203</div><div class='col col-border'><input type='text' value='0' id='203' onchange='changed(203)'></div><div class='col col-border'><label id='m203'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='204a'>204</div><div class='col col-border'><input type='text' value='0' id='204' onchange='changed(204)'></div><div class='col col-border'><label id='m204'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='205a'>205</div><div class='col col-border'><input type='text' value='0' id='205' onchange='changed(205)'></div><div class='col col-border'><label id='m205'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='206a'>206</div><div class='col col-border'><input type='text' value='0' id='206' onchange='changed(206)'></div><div class='col col-border'><label id='m206'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='207a'>207</div><div class='col col-border'><input type='text' value='0' id='207' onchange='changed(207)'></div><div class='col col-border'><label id='m207'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='208a'>208</div><div class='col col-border'><input type='text' value='0' id='208' onchange='changed(208)'></div><div class='col col-border'><label id='m208'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='209a'>209</div><div class='col col-border'><input type='text' value='0' id='209' onchange='changed(209)'></div><div class='col col-border'><label id='m209'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='210a'>210</div><div class='col col-border'><input type='text' value='0' id='210' onchange='changed(210)'></div><div class='col col-border'><label id='m210'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='211a'>211</div><div class='col col-border'><input type='text' value='0' id='211' onchange='changed(211)'></div><div class='col col-border'><label id='m211'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='212a'>212</div><div class='col col-border'><input type='text' value='0' id='212' onchange='changed(212)'></div><div class='col col-border'><label id='m212'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='213a'>213</div><div class='col col-border'><input type='text' value='0' id='213' onchange='changed(213)'></div><div class='col col-border'><label id='m213'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='214a'>214</div><div class='col col-border'><input type='text' value='0' id='214' onchange='changed(214)'></div><div class='col col-border'><label id='m214'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='215a'>215</div><div class='col col-border'><input type='text' value='0' id='215' onchange='changed(215)'></div><div class='col col-border'><label id='m215'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='216a'>216</div><div class='col col-border'><input type='text' value='0' id='216' onchange='changed(216)'></div><div class='col col-border'><label id='m216'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='217a'>217</div><div class='col col-border'><input type='text' value='0' id='217' onchange='changed(217)'></div><div class='col col-border'><label id='m217'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='218a'>218</div><div class='col col-border'><input type='text' value='0' id='218' onchange='changed(218)'></div><div class='col col-border'><label id='m218'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='219a'>219</div><div class='col col-border'><input type='text' value='0' id='219' onchange='changed(219)'></div><div class='col col-border'><label id='m219'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='220a'>220</div><div class='col col-border'><input type='text' value='0' id='220' onchange='changed(220)'></div><div class='col col-border'><label id='m220'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='221a'>221</div><div class='col col-border'><input type='text' value='0' id='221' onchange='changed(221)'></div><div class='col col-border'><label id='m221'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='222a'>222</div><div class='col col-border'><input type='text' value='0' id='222' onchange='changed(222)'></div><div class='col col-border'><label id='m222'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='223a'>223</div><div class='col col-border'><input type='text' value='0' id='223' onchange='changed(223)'></div><div class='col col-border'><label id='m223'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='224a'>224</div><div class='col col-border'><input type='text' value='0' id='224' onchange='changed(224)'></div><div class='col col-border'><label id='m224'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='225a'>225</div><div class='col col-border'><input type='text' value='0' id='225' onchange='changed(225)'></div><div class='col col-border'><label id='m225'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='226a'>226</div><div class='col col-border'><input type='text' value='0' id='226' onchange='changed(226)'></div><div class='col col-border'><label id='m226'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='227a'>227</div><div class='col col-border'><input type='text' value='0' id='227' onchange='changed(227)'></div><div class='col col-border'><label id='m227'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='228a'>228</div><div class='col col-border'><input type='text' value='0' id='228' onchange='changed(228)'></div><div class='col col-border'><label id='m228'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='229a'>229</div><div class='col col-border'><input type='text' value='0' id='229' onchange='changed(229)'></div><div class='col col-border'><label id='m229'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='230a'>230</div><div class='col col-border'><input type='text' value='0' id='230' onchange='changed(230)'></div><div class='col col-border'><label id='m230'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='231a'>231</div><div class='col col-border'><input type='text' value='0' id='231' onchange='changed(231)'></div><div class='col col-border'><label id='m231'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='232a'>232</div><div class='col col-border'><input type='text' value='0' id='232' onchange='changed(232)'></div><div class='col col-border'><label id='m232'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='233a'>233</div><div class='col col-border'><input type='text' value='0' id='233' onchange='changed(233)'></div><div class='col col-border'><label id='m233'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='234a'>234</div><div class='col col-border'><input type='text' value='0' id='234' onchange='changed(234)'></div><div class='col col-border'><label id='m234'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='235a'>235</div><div class='col col-border'><input type='text' value='0' id='235' onchange='changed(235)'></div><div class='col col-border'><label id='m235'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='236a'>236</div><div class='col col-border'><input type='text' value='0' id='236' onchange='changed(236)'></div><div class='col col-border'><label id='m236'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='237a'>237</div><div class='col col-border'><input type='text' value='0' id='237' onchange='changed(237)'></div><div class='col col-border'><label id='m237'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='238a'>238</div><div class='col col-border'><input type='text' value='0' id='238' onchange='changed(238)'></div><div class='col col-border'><label id='m238'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='239a'>239</div><div class='col col-border'><input type='text' value='0' id='239' onchange='changed(239)'></div><div class='col col-border'><label id='m239'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='240a'>240</div><div class='col col-border'><input type='text' value='0' id='240' onchange='changed(240)'></div><div class='col col-border'><label id='m240'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='241a'>241</div><div class='col col-border'><input type='text' value='0' id='241' onchange='changed(241)'></div><div class='col col-border'><label id='m241'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='242a'>242</div><div class='col col-border'><input type='text' value='0' id='242' onchange='changed(242)'></div><div class='col col-border'><label id='m242'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='243a'>243</div><div class='col col-border'><input type='text' value='0' id='243' onchange='changed(243)'></div><div class='col col-border'><label id='m243'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='244a'>244</div><div class='col col-border'><input type='text' value='0' id='244' onchange='changed(244)'></div><div class='col col-border'><label id='m244'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='245a'>245</div><div class='col col-border'><input type='text' value='0' id='245' onchange='changed(245)'></div><div class='col col-border'><label id='m245'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='246a'>246</div><div class='col col-border'><input type='text' value='0' id='246' onchange='changed(246)'></div><div class='col col-border'><label id='m246'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='247a'>247</div><div class='col col-border'><input type='text' value='0' id='247' onchange='changed(247)'></div><div class='col col-border'><label id='m247'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='248a'>248</div><div class='col col-border'><input type='text' value='0' id='248' onchange='changed(248)'></div><div class='col col-border'><label id='m248'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='249a'>249</div><div class='col col-border'><input type='text' value='0' id='249' onchange='changed(249)'></div><div class='col col-border'><label id='m249'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='250a'>250</div><div class='col col-border'><input type='text' value='0' id='250' onchange='changed(250)'></div><div class='col col-border'><label id='m250'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='251a'>251</div><div class='col col-border'><input type='text' value='0' id='251' onchange='changed(251)'></div><div class='col col-border'><label id='m251'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='252a'>252</div><div class='col col-border'><input type='text' value='0' id='252' onchange='changed(252)'></div><div class='col col-border'><label id='m252'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='253a'>253</div><div class='col col-border'><input type='text' value='0' id='253' onchange='changed(253)'></div><div class='col col-border'><label id='m253'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='254a'>254</div><div class='col col-border'><input type='text' value='0' id='254' onchange='changed(254)'></div><div class='col col-border'><label id='m254'>NOP</label></div></div><div class='row' id='inst'><div class='col col-border' id='255a'>255</div><div class='col col-border'><input type='text' value='0' id='255' onchange='changed(255)'></div><div class='col col-border'><label id='m255'>NOP</label></div></div>
    
</div>
</div>
</div>
    <script>
        var mostra_esconde = false;
        function mostraEsconde(){
            if(mostra_esconde){
                mostra_esconde = false;
                document.getElementById("json").style.display = 'none';
            }else{
                mostra_esconde = true;
                document.getElementById("json").style.display = 'block';
            }
        }
    </script>
    <script src="./js/jquery.min.js"></script>
    <script src="./js/bootstrap.min.js"></script>
</body>
</html>`);



