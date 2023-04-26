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
"Length"                return "LENGTH";
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
"--"                    return "DECREMENTO";
"++"                    return "INCREMENTO";
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
    const {Llamada} = require('../arbol/nodoAST.js');
    const {Vector} = require('../arbol/nodoAST.js');
    const {Lista} = require('../arbol/nodoAST.js');
%}

//precedencias
%left "OR"
%left "AND"
%right "NEGACION"
%left "DOBLE_IGUAL" "MAYOR" "MENOR" "NEGACION_IGUAL" "MENOR_IGUAL" "MAYOR_IGUAL"
%left 'SUMA' 'RESTA'
%left 'MULTIPLICACION' 'DIVISION' "MODULO"
%left URESTA
%right "POTENCIA"
%left 'INCREMENTO' 'DECREMENTO'

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
    | error PTCOMA  { console.error('Este es un error sintáctico: ' + yytext + ', en la linea: ' + this._$.first_line + ', en la columna: ' + this._$.first_column);}
;

declaracion_funcion 
    : tipo ID PAR_ABRE parametros PAR_CIERRA LLAVE_ABRE declaraciones_locales_tipo LLAVE_CIERRA { $$ = new Funcion($1, $2, $4, $7); }
    | tipo ID PAR_ABRE PAR_CIERRA LLAVE_ABRE declaraciones_locales_tipo LLAVE_CIERRA            { $$ = new Funcion($1, $2, [], $6); } //array vacio por no llevar parametros
    | VOID ID PAR_ABRE parametros PAR_CIERRA LLAVE_ABRE declaraciones_locales_vacio LLAVE_CIERRA { $$ = new Funcion("VOID", $2, $4, $7); }
    | VOID ID PAR_ABRE PAR_CIERRA LLAVE_ABRE declaraciones_locales_vacio LLAVE_CIERRA           { $$ = new Funcion("VOID", $2, [], $6); }
;

declaracion_variable 
    : tipo ID PUNTO_COMA { $$ = new DeclaracionVariables($1, $2); }
    | tipo ID IGUAL expresion PUNTO_COMA { $$ = new DeclaracionVariables($1, $2, $4); }
    | tipo ID IGUAL PAR_ABRE tipo PAR_CIERRA expresion PUNTO_COMA { $$ = new DeclaracionVariables($1, $2, $7, $5); }
    | tipo ID IGUAL expresion TERNARIO expresion DOS_PUNTOS expresion PUNTO_COMA { $$ = new DeclaracionVariables($1, $2); $$.guardarTernario($4, $6, $8);}
    | tipo COR_ABRE COR_CIERRE ID IGUAL NUEVO tipo COR_ABRE expresion COR_CIERRE PUNTO_COMA { $$ = new Vector($1, $4, $7, $9); }
    | tipo COR_ABRE COR_CIERRE ID IGUAL LLAVE_ABRE lista_valores LLAVE_CIERRA PUNTO_COMA    { $$ = new Vector($1, $4, null, $7); }
    | LISTA MENOR tipo MAYOR ID IGUAL NUEVO LISTA MENOR tipo MAYOR PUNTO_COMA               { $$ = new Lista($3, $5, $9); }
;

llamada_funcion 
    : ID PAR_ABRE argumentos PAR_CIERRA { $$ = new Llamada($1, $3); }
    | ID PAR_ABRE PAR_CIERRA { $$ = new Llamada($1); }
;

asignacion 
    : ID IGUAL expresion PUNTO_COMA {  }
    | ID IGUAL PAR_ABRE tipo PAR_CIERRA expresion PUNTO_COMA {  }
    | ID IGUAL expresion TERNARIO expresion DOS_PUNTOS expresion PUNTO_COMA {  }
    | ID INCREMENTO PUNTO_COMA
    | ID DECREMENTO PUNTO_COMA
    | ID COR_ABRE expresion COR_CIERRE IGUAL expresion PUNTO_COMA { }
    | ID PUNTO ADD PAR_ABRE expresion PAR_CIERRA PUNTO_COMA       { }
    | ID COR_ABRE COR_ABRE expresion COR_CIERRE COR_CIERRE IGUAL expresion PUNTO_COMA { }
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

lista_valores 
    : lista_valores COMA valor  { $1.push($3); $$ = $1; }
    | valor { $$ = [$1]; }
;

valor 
    : DECIMAL { $$ = $1; }
    | ENTERO { $$ = $1; }
    | CARACTER { $$ = $1; }
    | CADENA { $$ = $1; }
    | TRUE { $$ = $1; }
    | FALSE { $$ = $1; }
;

declaraciones_locales_tipo 
    : declaraciones_locales_tipo declaracion_local_tipo { $1.push($2); $$ = $1; }
    | declaracion_local_tipo { $$ = [$1]; }
;

declaraciones_locales_vacio 
    : declaraciones_locales_vacio declaracion_local_vacio { $1.push($2); $$ = $1; }
    | declaracion_local_vacio { $$ = [$1]; } 
;

declaracion_local_tipo 
    : sentencias { $$ = $1; }
    | RETURN expresion PUNTO_COMA { $$ = new Retorno($2); }
;

declaracion_local_vacio 
    : sentencias { $$ = $1; }
    | RETURN PUNTO_COMA { $$ = new Retorno(); }
;

expresion
    : expresion SUMA expresion { $$ = new Expresion("SUMA", $1, $3); }
    | expresion RESTA expresion { $$ = new Expresion("RESTA", $1, $3); }
    | RESTA expresion %prec URESTA { $$ = new Expresion("UNARIO", $2); }
    | expresion MULTIPLICACION expresion { $$ = new Expresion("MULTIPLICACION", $1, $3); }
    | expresion DIVISION expresion { $$ = new Expresion("DIVICION", $1, $3); }
    | PAR_ABRE expresion PAR_CIERRA { $$ = new Expresion("PAR", $2); }
    | valor { $$ = new Expresion("VALOR", $1); }
    | ID { $$ = new Expresion("ID", $1); }
    | llamada_funcion { $$ = $1; }
    | ID INCREMENTO {  }
    | ID DECREMENTO {  }
    | expresion POTENCIA expresion { $$ = new Expresion("POTENCIA", $1, $3); }
    | expresion MODULO expresion    { $$ = new Expresion("MODULO", $1, $3); }
    | ID COR_ABRE expresion COR_CIERRE {  } 
    | ID COR_ABRE COR_ABRE expresion COR_CIERRE COR_CIERRE {  }   
    | expresion MAYOR expresion		
    | expresion MENOR expresion		
    | expresion MAYOR_IGUAL expresion	
    | expresion MENOR_IGUAL expresion	
    | expresion DOBLE_IGUAL expresion			
    | expresion NEGACION_IGUAL expresion			
    | expresion AND expresion     
    | expresion OR expresion 		
    | NOT expresion							
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
;

argumentos 
    : argumentos COMA expresion { $1.push($3); $$ = $1; }
    | expresion { $$ = [$1]; }
;

sentencia_condicional_if 
    : IF PAR_ABRE expresion PAR_CIERRA LLAVE_ABRE sentencias LLAVE_CIERRA
    | IF PAR_ABRE expresion PAR_CIERRA LLAVE_ABRE sentencias LLAVE_CIERRA ELSE LLAVE_ABRE sentencias LLAVE_CIERRA
    | IF PAR_ABRE expresion PAR_CIERRA LLAVE_ABRE sentencias LLAVE_CIERRA ELSE sentencia_condicional_if
;

sentencia_condicional_switch 
    : SWITCH PAR_ABRE expresion PAR_CIERRA LLAVE_ABRE case_list default_case LLAVE_CIERRA
    | SWITCH PAR_ABRE expresion PAR_CIERRA LLAVE_ABRE case_list LLAVE_CIERRA
    | SWITCH PAR_ABRE expresion PAR_CIERRA LLAVE_ABRE default_case LLAVE_CIERRA
;

case_list 
    : CASE expresion DOS_PUNTOS sentencias
    | CASE expresion DOS_PUNTOS sentencias BREAK PUNTO_COMA
;

default_case 
    : DEFAULT DOS_PUNTOS sentencias BREAK PUNTO_COMA
;

sentencia_bucle_while 
    : WHILE PAR_ABRE expresion PAR_CIERRA LLAVE_ABRE sentencias LLAVE_CIERRA
; //hacer que las sentencias tengan break y continue

sentencia_bucle_for 
    : FOR PAR_ABRE declaracion_variable_for PUNTO_COMA expresion PUNTO_COMA actualizacion PAR_CIERRA LLAVE_ABRE sentencias LLAVE_CIERRA
; //hacer que las sentencias tengan break y continue

sentencia_bucle_do_while 
    : DO LLAVE_ABRE sentencias LLAVE_CIERRA WHILE PAR_ABRE expresion PAR_CIERRA PUNTO_COMA
; //hacer que las sentencias tengan break y continue

declaracion_variable_for 
    : tipo ID IGUAL expresion PUNTO_COMA
    | tipo ID IGUAL PAR_ABRE tipo PAR_CIERRA expresion PUNTO_COMA
    | asignacion
;

actualizacion 
    : ID DECREMENTO
    | ID INCREMENTO
    | asignacion
;
