%lex
%options case-insensitive
%x string
//definicion lexica
%%
//ignorar
"//".*                  {/*comentario simple se ignora*/}
[/][*][^*]*[*]+([^/*][^*]*[*]+)*[/]         {/*comentario compuesto se ignora*/}
\s+                     {/*espacio en blanco a ignorar*/}
[\r\t]+                 {}
\n                      {}


//palabras reservadas
"int"                   return "INT";
"double"                return "DOUBLE";
"boolean"               return "BOOL";
"char"                  return "CHAR";
"string"                return "STRING";
"true"                  return "TRUE";
"false"                 return "FALSE";
"print"                 return "IMPRIMIR";
"new"                   return "NUEVO";
"add"                   return "ADD";
"if"                    return "IF";
"else"                  return "ELSE";
"switch"                return "SWITCH";
"break"                 return "BREAK";
"case"                  return "CASE";
"default"               return "DEFAULT";
"while"                 return "WHILE";
"for"                   return "FOR";
"do"                    return "DO";
"continue"              return "CONTINUE";
"void"                  return "VOID";
"return"                return "RETURN";
"toUpper"               return "TO_UPPER";
"toLower"               return "TO_LOWER";
"length"                return "LENGTH";
"Truncate"              return "TRUNCATE";
"Round"                 return "ROUND";
"Typeof"                return "TYPEOF";
"toString"              return "TO_STRING";
"toCharArray"           return "TO_CHAR_ARRAY";
"Main"                  return "MAIN";
"list"                  return "LISTA";


//signos
">="                    return "MAYOR_IGUAL";
"<="                    return "MENOR_IGUAL";
"=="                    return "DOBLE_IGUAL";
"!="                    return "NEGACION_IGUAL";
"++"                    return "INCREMENTO";
"--"                    return "DECREMENTO";
"+"                     return "SUMA";
"-"                     return "RESTA";
";"                     return "PUNTO_COMA";
"*"                     return "MULTIPLICACION";
"/"                     return "DIVISION";
"^"                     return "POTENCIA";
"%"                     return "MODULO";
"!"                     return "NEGACION";
"="                     return "IGUAL";
"<"                     return "MENOR";
">"                     return "MAYOR";
"?"                     return "TERNARIO";
":"                     return "DOS_PUNTOS";
"||"                    return "OR";
"&&"                    return "AND";
"("                     return "PAR_ABRE";
")"                     return "PAR_CIERRA";
"{"                     return "LLAVE_ABRE";
"}"                     return "LLAVE_CIERRA";
"."                     return "PUNTO";
"["                     return "COR_ABRE";
"]"                     return "COR_CIERRE";
','                     return "COMA";


//expresion regulares grandes
([a-zA-Z])[a-zA-Z0-9_]* return "ID";
[0-9]+"."[0-9]+\b       return "DECIMAL";
[0-9]+\b                return "ENTERO";
\'((\\\')|[^\n\'])*\'	{yytext = yytext.substr(1,yyleng-2); return 'CARACTER'; }
["]                     {cadena = ""; this.begin("string");}
<string>[^"\\\r\n]+       {cadena += yytext;}
<string>"\\\""          {cadena += "\"";}
<string>"\\n"           {cadena += "\n";}
<string>"\\t"           {cadena += "\t";}
<string>"\\\\"          {cadena += "\\";}
<string>"\\'"           {cadena += "\'";}
<string>["]             {yytext = cadena; this.popState(); return 'CADENA';}
<string>[\r\n]          {console.log("Caracter no reconocido: ", yylloc.first_line, yylloc.first_column, "-", yylloc.last_column, "Error lexico", yytext);}

<<EOF>>				    return 'EOF';

// errores
.                       {console.log("Caracter no reconocido: ", yylloc.first_line, yylloc.first_column, "-", yylloc.last_column, "Error lexico", yytext);}

/lex
//mi codigo
%{
    const {Funcion} = require('../arbol/nodoAST.js');
    const {DeclaracionVariables} = require('../arbol/nodoAST.js');
    const {Retorno} = require('../arbol/nodoAST.js');
    const {Parametros} = require('../arbol/nodoAST.js');
    const {Expresion} = require('../arbol/nodoAST.js');
    const {Llamada, Largo, Tolower,Toupper} = require('../arbol/nodoAST.js');
    const {Vector} = require('../arbol/nodoAST.js');
    const {Lista} = require('../arbol/nodoAST.js');
    const {Asignacion} = require('../arbol/nodoAST.js');
    const {Imprimir} = require('../arbol/nodoAST.js');
    const {ActualizarLista} = require('../arbol/nodoAST.js');
    const {ExpresionLogica} = require('../arbol/nodoAST.js');
    const {Incremento} = require('../arbol/nodoAST.js');
    const {Decremento} = require('../arbol/nodoAST.js');
    const {ExpresionRelacional} = require('../arbol/nodoAST.js');
    const {InstruccionIf} = require('../arbol/nodoAST.js');
    const {IntruccionSwitch} = require('../arbol/nodoAST.js');
    const {InstruccionCase} = require('../arbol/nodoAST.js');
    const {BucleWhile} = require('../arbol/nodoAST.js');
    const {BucleFor} = require('../arbol/nodoAST.js');
    const {BucleDoWhile} = require('../arbol/nodoAST.js');
%}

//precedencias
%left "OR"
%left "AND"
%right "NEGACION"
%left "DOBLE_IGUAL" "MAYOR" "MENOR" "NEGACION_IGUAL" "MENOR_IGUAL" "MAYOR_IGUAL"
%left 'SUMA' 'RESTA'
%left 'MULTIPLICACION' 'DIVISION' "MODULO"
%nonassoc "POTENCIA"
%left URESTA
%left 'DECREMENTO' 'INCREMENTO'

%start programa

%% //gramatica
programa 
    : instrucciones EOF { return $1; }
;

instrucciones 
    : instrucciones instruccion     { $1.push($2); $$ = $1;}
    | instruccion                   { $$ = [$1]; }
;

instruccion 
    : declaracion_funcion { $$ = $1; }
    | declaracion_variable { $$ = $1; }
    | MAIN llamada_funcion PUNTO_COMA { $$ = $2; $2.main = true; }
    | asignacion { $$ = $1; }
    | error PUNTO_COMA  { console.error('Este es un error sintáctico: ' + yytext + ', en la linea: ' + this._$.first_line + ', en la columna: ' + this._$.first_column);}
;

declaracion_funcion 
    : tipo ID PAR_ABRE parametros PAR_CIERRA LLAVE_ABRE declaraciones_locales LLAVE_CIERRA { $$ = new Funcion($1, $2, $4, $7); }
    | tipo ID PAR_ABRE PAR_CIERRA LLAVE_ABRE declaraciones_locales LLAVE_CIERRA            { $$ = new Funcion($1, $2, [], $6); } //array vacio por no llevar parametros
    | VOID ID PAR_ABRE parametros PAR_CIERRA LLAVE_ABRE declaraciones_locales LLAVE_CIERRA { $$ = new Funcion("VOID", $2, $4, $7); }
    | VOID ID PAR_ABRE PAR_CIERRA LLAVE_ABRE declaraciones_locales LLAVE_CIERRA           { $$ = new Funcion("VOID", $2, [], $6); }
;

declaracion_variable 
    : tipo ID PUNTO_COMA { $$ = new DeclaracionVariables($1, $2); }
    | tipo ID IGUAL expresion PUNTO_COMA { $$ = new DeclaracionVariables($1, $2, $4); }
    | tipo ID IGUAL PAR_ABRE tipo PAR_CIERRA expresion PUNTO_COMA { $$ = new DeclaracionVariables($1, $2, $7, $5); }
    | tipo ID IGUAL expresion TERNARIO expresion DOS_PUNTOS expresion PUNTO_COMA { $$ = new DeclaracionVariables($1, $2); $$.guardarTernario($4, $6, $8);}
    | tipo COR_ABRE COR_CIERRE ID IGUAL NUEVO tipo COR_ABRE expresion COR_CIERRE PUNTO_COMA { $$ = new Vector($1, $4, $7, $9); }
    | tipo COR_ABRE COR_CIERRE ID IGUAL LLAVE_ABRE lista_valores LLAVE_CIERRA PUNTO_COMA    { $$ = new Vector($1, $4, $1, null, $7); }
    | LISTA MENOR tipo MAYOR ID IGUAL NUEVO LISTA MENOR tipo MAYOR PUNTO_COMA               { $$ = new Lista($3, $5, $10); }
;

llamada_funcion 
    : ID PAR_ABRE argumentos PAR_CIERRA { $$ = new Llamada($1, $3); }
    | ID PAR_ABRE PAR_CIERRA { $$ = new Llamada($1); }
    | LENGTH PAR_ABRE expresion PAR_CIERRA { $$ = new Largo($3); }
    | TO_LOWER PAR_ABRE expresion PAR_CIERRA { $$ = new Tolower($3); }
    | TO_UPPER PAR_ABRE expresion PAR_CIERRA { $$ = new Toupper($3); }
;

asignacion 
    : ID IGUAL expresion PUNTO_COMA{ $$ = new Asignacion($1, $3); }
    | ID IGUAL PAR_ABRE tipo PAR_CIERRA expresion PUNTO_COMA{ $$ = new Asignacion($1, $6, $4); }
    | ID IGUAL expresion TERNARIO expresion DOS_PUNTOS expresion  PUNTO_COMA{ $$ = new Asignacion($1); $$.guardarTernario($3, $5, $7);}
    | ID COR_ABRE expresion COR_CIERRE IGUAL expresion PUNTO_COMA { $$ = new Asignacion($1, $6, null, $3); }
    | ID PUNTO ADD PAR_ABRE expresion PAR_CIERRA PUNTO_COMA { $$ = new ActualizarLista($1, $5); }
    | ID COR_ABRE COR_ABRE expresion COR_CIERRE COR_CIERRE IGUAL expresion PUNTO_COMA { $$ = new ActualizarLista($1, $8, $4); }
;

parametros 
    : parametros COMA tipo ID { $1.push(new Parametros($3, $4)); $$ = $1; }
    | tipo ID { $$ = [new Parametros($1, $2)]; }
;

tipo 
    : INT { $$ = "INT"; }
    | DOUBLE { $$ = "DOUBLE"; }
    | BOOL { $$ = "BOOL"; }
    | CHAR { $$ = "CHAR"; }
    | STRING { $$ = "STRING"; }
;

argumentos 
    : argumentos COMA expresion { $1.push($3); $$ = $1; }
    | expresion { $$ = [$1]; }
;

lista_valores 
    : lista_valores COMA expresion  { $1.push($3); $$ = $1; }
    | expresion { $$ = [$1]; }
;

valor //utilizar clases
    : DECIMAL { $$ = parseFloat($1); }
    | ENTERO { $$ = parseInt($1); }
    | CARACTER { $$ = $1; }
    | CADENA { $$ = $1; }
    | TRUE { $$ = true; }
    | FALSE { $$ = false; }
;

declaraciones_locales
    : declaraciones_locales sentencias { $1.push($2); $$ = $1; }
    | sentencias { $$ = [$1]; }
;

sentencias 
    : declaracion_variable { $$ = $1; }
    | asignacion { $$ = $1; }
    | llamada_funcion PUNTO_COMA { $$ = $1; }
    | sentencia_condicional_if { $$ = $1; }
    | sentencia_condicional_switch { $$ = $1; }
    | sentencia_bucle_while { $$ = $1; }
    | sentencia_bucle_for { $$ = $1; }
    | sentencia_bucle_do_while { $$ = $1; }
    | IMPRIMIR PAR_ABRE expresion PAR_CIERRA PUNTO_COMA { $$ = new Imprimir($3); }
    | BREAK PUNTO_COMA { $$ = "BREAK"; }
    | CONTINUE PUNTO_COMA { $$ = "CONTINUE"; }
    | RETURN expresion PUNTO_COMA { $$ = new Retorno($2); }
    | RETURN PUNTO_COMA { $$ = new Retorno(); }
    | ID INCREMENTO PUNTO_COMA { $$ = new Incremento($1); }
    | ID DECREMENTO PUNTO_COMA { $$ = new Decremento($1); }	
;

expresion
    : expresion SUMA expresion { $$ = new Expresion("SUMA", $1, $3); }
    | expresion RESTA expresion { $$ = new Expresion("RESTA", $1, $3); }
    | RESTA expresion %prec URESTA { $$ = new Expresion("UNARIO", $2); }
    | expresion MULTIPLICACION expresion { $$ = new Expresion("MULTIPLICACION", $1, $3); }
    | expresion DIVISION expresion { $$ = new Expresion("DIVICION", $1, $3); }
    | PAR_ABRE expresion PAR_CIERRA { $$ = new Expresion("PAR", $2); }
    | valor { $$ = new Expresion("VALOR", $1); }//cambiar al valor de una clase
    | ID { $$ = new Expresion("ID", $1); }
    | llamada_funcion { $$ = new Expresion("LLAMADA", $1); }
    | expresion POTENCIA expresion { $$ = new Expresion("POTENCIA", $1, $3); }
    | expresion MODULO expresion    { $$ = new Expresion("MODULO", $1, $3); }
    | ID COR_ABRE expresion COR_CIERRE { $$ = new Expresion("VECTOR", $1, $3); }
    | ID COR_ABRE COR_ABRE expresion COR_CIERRE COR_CIERRE { $$ = new Expresion("LISTA", $1, $4); } //falta lista  
    | expresion MAYOR expresion { $$ = new ExpresionRelacional("MAYOR", $1, $3); }
    | expresion MENOR expresion	{ $$ = new ExpresionRelacional("MENOR", $1, $3); }
    | expresion MAYOR_IGUAL expresion { $$ = new ExpresionRelacional("MAYOR_IGUAL", $1, $3); }
    | expresion MENOR_IGUAL expresion { $$ = new ExpresionRelacional("MENOR_IGUAL", $1, $3); }
    | expresion DOBLE_IGUAL expresion { $$ = new ExpresionRelacional("DOBLE_IGUAL", $1, $3); }
    | expresion NEGACION_IGUAL expresion { $$ = new ExpresionRelacional("NEGACION_IGUAL", $1, $3); }
    | expresion AND expresion { $$ = new ExpresionLogica("AND", $1, $3); }
    | expresion OR expresion { $$ = new ExpresionLogica("OR", $1, $3); }
    | NEGACION expresion { $$ = new ExpresionLogica("NEGACION", $2); }
    | expresion INCREMENTO { $$ = new Expresion("INCREMENTO", $1); }
    | expresion DECREMENTO { $$ = new Expresion("DECREMENTO", $1); }
;

sentencia_condicional_if 
    : IF PAR_ABRE expresion PAR_CIERRA LLAVE_ABRE declaraciones_locales LLAVE_CIERRA { $$ = new InstruccionIf($3, $6); }
    | IF PAR_ABRE expresion PAR_CIERRA LLAVE_ABRE declaraciones_locales LLAVE_CIERRA ELSE LLAVE_ABRE declaraciones_locales LLAVE_CIERRA { $$ = new InstruccionIf($3, $6, $10); }
    | IF PAR_ABRE expresion PAR_CIERRA LLAVE_ABRE declaraciones_locales LLAVE_CIERRA ELSE sentencia_condicional_if { $$ = new InstruccionIf($3, $6, [], $9); }
;

sentencia_condicional_switch 
    : SWITCH PAR_ABRE expresion PAR_CIERRA LLAVE_ABRE case_list default_case LLAVE_CIERRA { $$ = new IntruccionSwitch($3, $6, $7); }
    | SWITCH PAR_ABRE expresion PAR_CIERRA LLAVE_ABRE case_list LLAVE_CIERRA { $$ = new IntruccionSwitch($3, $6); }
    | SWITCH PAR_ABRE expresion PAR_CIERRA LLAVE_ABRE default_case LLAVE_CIERRA { $$ = new IntruccionSwitch($3, [], $6); }
;

case_list 
    : case_list case { $1.push($2); $$ = $1; }
    | case { $$ = [$1]; }
;

case
    : CASE expresion DOS_PUNTOS declaraciones_locales { $$ = new InstruccionCase($2, $4); }
;

default_case 
    : DEFAULT DOS_PUNTOS declaraciones_locales { $$ = $3; }
;

sentencia_bucle_while 
    : WHILE PAR_ABRE expresion PAR_CIERRA LLAVE_ABRE declaraciones_locales LLAVE_CIERRA { $$ = new BucleWhile($3, $6); }
;

sentencia_bucle_do_while 
    : DO LLAVE_ABRE declaraciones_locales LLAVE_CIERRA WHILE PAR_ABRE expresion PAR_CIERRA PUNTO_COMA { $$ = new BucleDoWhile($7, $3); }
;

sentencia_bucle_for 
    : FOR PAR_ABRE declaracion_variable_for expresion PUNTO_COMA actualizacion PAR_CIERRA LLAVE_ABRE declaraciones_locales LLAVE_CIERRA { $$ = new BucleFor($3, $4, $6, $9); }
; 

declaracion_variable_for 
    : declaracion_variable { $$ = $1; }
    | asignacion { $$ = $1; }
;

actualizacion
    : ID IGUAL expresion { $$ = new Asignacion($1, $3); }
    | ID IGUAL PAR_ABRE tipo PAR_CIERRA expresion { $$ = new Asignacion($1, $6, $4); }
    | ID IGUAL expresion TERNARIO expresion DOS_PUNTOS expresion { $$ = new Asignacion($1); $$.guardarTernario($3, $5, $7);}
    | ID COR_ABRE expresion COR_CIERRE IGUAL expresion { $$ = new Asignacion($1, $6, null, $3); }
    | ID PUNTO ADD PAR_ABRE expresion PAR_CIERRA { $$ = new ActualizarLista($1, $5); } //falta
    | ID COR_ABRE COR_ABRE expresion COR_CIERRE COR_CIERRE IGUAL expresion { $$ = new ActualizarLista($1, $8, $4); } //falta
    | ID INCREMENTO { $$ = new Incremento($1); }
    | ID DECREMENTO { $$ = new Decremento($1); }
;