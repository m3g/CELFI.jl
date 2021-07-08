var documenterSearchIndex = {"docs":
[{"location":"sistema/#Sistema-simulado","page":"Sistema simulado","title":"Sistema simulado","text":"","category":"section"},{"location":"sistema/","page":"Sistema simulado","title":"Sistema simulado","text":"La simulación es de un fluido de 100 partículas (mono-atómicas) que interactúan por un potencial de Lennard-Jones, en un sistema bi-dimensional, periódico.","category":"page"},{"location":"sistema/","page":"Sistema simulado","title":"Sistema simulado","text":"V = 4epsilon left( fracsigma^12r^12 - fracsigma^6r^6 right)","category":"page"},{"location":"sistema/","page":"Sistema simulado","title":"Sistema simulado","text":"Abra el archivo potential.jl y entienda la implementación del cálculo de la energía potencial. Note que el cálculo depende de 3 parámetros: epsilon, sigma, y el tamaño del sistema periódico. Los parámetros están definidos en la estructura de datos opt, de entrada (veremos más tarde como usarla). ","category":"page"},{"location":"sistema/","page":"Sistema simulado","title":"Sistema simulado","text":"El archivo forces.jl contiene el cálculo de las fuerzas (el gradiente del potencial), y el archivo kinetic.jl contiene el cálculo de la energía cinética. Como el sistema usa condiciones periódicas de contorno, las coordenadas tienen que siempre ser calculadas en relación a la imagen mínima. El cálculo de la imagen mínima está implementado en el archivo image.jl. Es interesante entender la implementación de cada una de estas funciones, que son comunes a todos los métodos que vamos a describir. ","category":"page"},{"location":"sistema/#.1.-Parámetros-y-opciones-de-la-simulación","page":"Sistema simulado","title":"2.1. Parámetros y opciones de la simulación","text":"","category":"section"},{"location":"sistema/","page":"Sistema simulado","title":"Sistema simulado","text":"Para inciar los trabajos, abra una sección de Julia, y dé el comando:","category":"page"},{"location":"sistema/","page":"Sistema simulado","title":"Sistema simulado","text":"julia> using CELFI","category":"page"},{"location":"sistema/","page":"Sistema simulado","title":"Sistema simulado","text":"Los parámetros de las simulaciones son controlados en la inicialización de la estructure Options, por ejemplo:","category":"page"},{"location":"sistema/","page":"Sistema simulado","title":"Sistema simulado","text":"julia> opt = Options(sides=[100,100],dt=0.01)\nOptions{Point2D}\n-------------------\nSimulation options:\n-------------------\ndt = 0.01\nnsteps = 2000\nsides = [100.0, 100.0]\neps = 1.0\nsig = 2.0\nkavg_target = 0.6\nibath = 1\nprintxyz = true\nprintvel = false\niprint = 1\niprintxyz = 2\ntrajectory_file = traj.xyz\nenergies_file = energies.dat\nvelocities_file = velocities.dat\n\njulia>","category":"page"},{"location":"sistema/","page":"Sistema simulado","title":"Sistema simulado","text":"En este caso, ajustamos en tamaño del sistema y el paso de tiempo manualmente, y mantuvimos todas las otras opciones con valores default. Cada uno de estos paráemetros será discutido oportunamente. Note que definen el tamaño, campo de fuerza (epsilon y sigma), energía cinética (temperatura), y los nombres de los archivos de salida. ","category":"page"},{"location":"sistema/#.2.-Coordenadas-iniciales","page":"Sistema simulado","title":"2.2. Coordenadas iniciales","text":"","category":"section"},{"location":"sistema/","page":"Sistema simulado","title":"Sistema simulado","text":"La coordenadas iniciales pueden ser creadas aleatoriamente, usando: ","category":"page"},{"location":"sistema/","page":"Sistema simulado","title":"Sistema simulado","text":"julia> x = [ opt.sides .* rand(Point2D) for i in 1:100 ]\n100-element Vector{Point}:\n [18.36579648764145, 7.711401822973363]\n [41.784092301135665, 45.61852102711508]\n [23.850299728474454, 63.797752122286425]\n ⋮\n [92.5679156243071, 39.272476774702206]\n [26.845528447086274, 92.88216539818639]\n","category":"page"},{"location":"sistema/","page":"Sistema simulado","title":"Sistema simulado","text":"que genera 100 puntos en 2 dimensiones, aleatórios, con coordenadas entre [0,0] y opt.sides = [100,100], en este caso. Point2D es un tipo de variable que representa un punto en dos dimensiones. Mas adelante vamos a ver que todo el código es genérico, y podemos hacer simulaciones en 3 dimensiones apenas modificando el tipo de variable asociado. ","category":"page"},{"location":"sistema/","page":"Sistema simulado","title":"Sistema simulado","text":"note: Note\nEl punto . en .* indica que es una multiplicación componente-a-componente, de cada componente del vector opt.sides por cada componente del vector associado a cada punto. ","category":"page"},{"location":"sistema/#.3.-Minimización-de-la-energia","page":"Sistema simulado","title":"2.3. Minimización de la energia","text":"","category":"section"},{"location":"sistema/","page":"Sistema simulado","title":"Sistema simulado","text":"En seguida, el punto inicial va a ser modificado usando  el Método del Gradiente para minimizar la energía. El método consiste en mover las partículas según la aproximación de Taylor de orden uno, en la dirección de descenso de energía:","category":"page"},{"location":"sistema/","page":"Sistema simulado","title":"Sistema simulado","text":"vecx_i+1 = vecx_i - nabla V(vecx_i) Delta x","category":"page"},{"location":"sistema/","page":"Sistema simulado","title":"Sistema simulado","text":"Si la energía en el punto vecx_i+1 es menor que la energía en el punto vecx_i, se acepta el punto vecx_i+1 y el proceso es repetido. Si no, Delta x es disminuido (Delta x = Delta x  2), y un nuevo punto vecx_i+1 es calculado. Como la aproximación debe ser una buena aproximación en las cercanias del punto corriente (vecx_i), un gradiente negativo garante que la función disminuye para Delta x suficientemente pequeño. El proceso es interrumpido cuando la norma del gradiente es pequeña, o cuando demasiados puntos fueron testados. En mecánica, -nabla V = vecF, entonces la función que calcula el gradiente es la misma que calcula las fuerzas en la simulación. Abra el archivo minimize.jl para discutir como se crea el punto inicial. ","category":"page"},{"location":"sistema/","page":"Sistema simulado","title":"Sistema simulado","text":"Antes de ejecutar la minimización de energia, vamos a copiar el punto inicial, para comparación:","category":"page"},{"location":"sistema/","page":"Sistema simulado","title":"Sistema simulado","text":"julia> x0 = copy(x)","category":"page"},{"location":"sistema/","page":"Sistema simulado","title":"Sistema simulado","text":"En seguida, minimizamos la energia con la función minimize!:","category":"page"},{"location":"sistema/","page":"Sistema simulado","title":"Sistema simulado","text":"julia> minimize!(x,opt)\nEnergy before minimization: 38322.72337856496\nEnergy after minimization: -74.15646912098042","category":"page"},{"location":"sistema/","page":"Sistema simulado","title":"Sistema simulado","text":"En Julia es una convención que las funciones que modifican sus argumentos terminan en !. En este caso, la función va a modificar las posiciones, x, de las partículas. ","category":"page"},{"location":"sistema/","page":"Sistema simulado","title":"Sistema simulado","text":"Podemos ver rapidamente que ocurrió con las particulas, colocando-las en un gráfico. Primero, generamos un gráfico de los puntos antes de la minimización:","category":"page"},{"location":"sistema/","page":"Sistema simulado","title":"Sistema simulado","text":"julia> using Plots\n\njulia> scatter(Tuple.(x0))","category":"page"},{"location":"sistema/","page":"Sistema simulado","title":"Sistema simulado","text":"Los puntos deben estar aleatoriamente distribuídos, y en particular algunos puntos deben estar muy cercanos a los otros, lo que genera potenciales muy repulsivos.","category":"page"},{"location":"sistema/","page":"Sistema simulado","title":"Sistema simulado","text":"En seguida, hacemos el gráfico del punto con energia mínima obtenido:","category":"page"},{"location":"sistema/","page":"Sistema simulado","title":"Sistema simulado","text":"julia> scatter(Tuple.(x))","category":"page"},{"location":"sistema/","page":"Sistema simulado","title":"Sistema simulado","text":"y notará que los puntos ahora tienen una nueva disposición: hay puntos formando clusteres, porque el potencial de Lennard-Jones es atractivo en distáncias largas. Pero no hay más puntos muy cercanos generando repulsiones muy grandes.","category":"page"},{"location":"sistema/","page":"Sistema simulado","title":"Sistema simulado","text":"Este punto inicial de energia mínima será usado en nuestras simulaciones. ","category":"page"},{"location":"sistema/","page":"Sistema simulado","title":"Sistema simulado","text":"note: Note\nLos gráficos puden ser salvos como figuras con savefig(\"plot.pdf\"), por ejemplo.","category":"page"},{"location":"sistema/#.4.-Temperatura","page":"Sistema simulado","title":"2.4. Temperatura","text":"","category":"section"},{"location":"sistema/","page":"Sistema simulado","title":"Sistema simulado","text":"La temperatura del sistema es un parámetro también definido internamente en el programa (puede ser modificado a gusto, pero no lo haremos). La temperatura se define a partir energía cinética media asociada a cada grado de libertad de movimiento del sistema. En el caso que todos los movimientos pueden ser escritos como translaciones, la definición es","category":"page"},{"location":"sistema/","page":"Sistema simulado","title":"Sistema simulado","text":"frac12kT = left frac12 m v_x^2right","category":"page"},{"location":"sistema/","page":"Sistema simulado","title":"Sistema simulado","text":"donde la media, hecha sobre v_x aqui, es equivalente si hecha sobre cualquier otro grado de libertad de translación. En un sistema tridimensional, por lo tanto, ","category":"page"},{"location":"sistema/","page":"Sistema simulado","title":"Sistema simulado","text":"leftfrac12m vecv^2 right = \nleftfrac12m left(v_x^2 + v_y^2 + v_z^2right) right = \n3left frac12 m v_x^2 right = frac32kT","category":"page"},{"location":"sistema/","page":"Sistema simulado","title":"Sistema simulado","text":"que es el resultado usual.","category":"page"},{"location":"sistema/","page":"Sistema simulado","title":"Sistema simulado","text":"Nuestras simulaciones son de un sistema bi-dimensional. En este caso,","category":"page"},{"location":"sistema/","page":"Sistema simulado","title":"Sistema simulado","text":"left frac12m vecv^2 right = \nleft frac12m left(v_x^2 + v_y^2right)right =\n2left frac12m v_x^2 right = kT","category":"page"},{"location":"sistema/","page":"Sistema simulado","title":"Sistema simulado","text":"En los códigos de dinámica molecular, la definición de temperatura se da, así, por la definición de la energía cinética media o, en este caso, por kT. En el código de Monte-Carlo la definición de temperatura se da por la tasa de aceptación, con la misma definición. ","category":"page"},{"location":"sistema/","page":"Sistema simulado","title":"Sistema simulado","text":"En todos los códigos fue escogido que se objetiva simular el sistema a la temperatura que corresponde a kT = 06 unidades. Los sistemas simulados tiene 100 partículas, por lo tanto la energía cinética media es 100kT=60 unidades. Las velocidades iniciales van a ser generadas aleatoriamente al princípio de la simulación. ","category":"page"},{"location":"simple/#Simulación-de-Dinámica-Molecular-Microcanónica","page":"Simulación microcanónica","title":"Simulación de Dinámica Molecular Microcanónica","text":"","category":"section"},{"location":"simple/","page":"Simulación microcanónica","title":"Simulación microcanónica","text":"Abra el archivo md-simple.jl, que contiene el algoritmo de simulación. La simulación empieza con velocidades aleatorias, ajustadas para la media termodinámica deseada de 0.6 unidades/átomo. A esta energía cinética media le llamaremos ``temperatura''. El algoritmo de integración es Velocity-Verlet, que consiste en propagar la posiciones con","category":"page"},{"location":"simple/","page":"Simulación microcanónica","title":"Simulación microcanónica","text":"vecx(t+Delta t) = vecx(t) + vecv(t)Delta t + frac12veca(t)Delta t^2","category":"page"},{"location":"simple/","page":"Simulación microcanónica","title":"Simulación microcanónica","text":"siendo veca(t)=vecF(t)m, donde vecF(t) es la fuerza en el tiempo corriente.  La fuerza en seguida es calculada en un tiempo posterior de tiempo con","category":"page"},{"location":"simple/","page":"Simulación microcanónica","title":"Simulación microcanónica","text":"vecF(t+Delta t) = -nabla Vleftvecx(t)right","category":"page"},{"location":"simple/","page":"Simulación microcanónica","title":"Simulación microcanónica","text":"y entonces las velocidades en el instante siguiente son calculadas con","category":"page"},{"location":"simple/","page":"Simulación microcanónica","title":"Simulación microcanónica","text":"vecv(t+Delta t) = vecv(t) +\nfrac12left\nfracvecF(t)m+fracvecF(t+Delta t)mright","category":"page"},{"location":"simple/","page":"Simulación microcanónica","title":"Simulación microcanónica","text":"completando el ciclo. En este ejemplo las masas son consideradas unitarias, para simplificar. La simulación es ejecutada por nsteps pasos, con paso de integración Delta t, este siendo un parámetro de entrada, dt, definido en Options. ","category":"page"},{"location":"simple/","page":"Simulación microcanónica","title":"Simulación microcanónica","text":"La simulación no tiene control de temperatura o de presión. Es una propagación de la trajectória según las leyes de Newton, que deberían conservar la energia. A esto se le llama una simulación \"microcanónica\", o \"NVE\" (que conserva, en princípio, el número de partículas, el volumen y la energia total).","category":"page"},{"location":"simple/#.1.-Paso-de-integración","page":"Simulación microcanónica","title":"3.1. Paso de integración","text":"","category":"section"},{"location":"simple/","page":"Simulación microcanónica","title":"Simulación microcanónica","text":"Para realizar una MD simple, con un paso de integración de dt=1.0, ejecute le comando:","category":"page"},{"location":"simple/","page":"Simulación microcanónica","title":"Simulación microcanónica","text":"julia> md(x,Options(dt=1.0))\n","category":"page"},{"location":"simple/","page":"Simulación microcanónica","title":"Simulación microcanónica","text":"En princípio, está previso realizar 2000 pasos de integración de las equaciones  de movimimiento.  Pruebe pasos de integración entre 1.0 y 0.01.  Note que pasa con la energía. Note que pasa con la energía cinética media, la cual fue inicializada en 0.6 unidades/átomo. Discuta la elección del paso de integración, y los valores de energía cinética obtenidos. Las simulaciones que siguen van a usar un paso de integración dt = 0.05.","category":"page"},{"location":"simple/","page":"Simulación microcanónica","title":"Simulación microcanónica","text":"Al conseguir una simulación estable hasta el fin, observe el gráfico de energía en función del tiempo, usando el comando: \\command{xmgrace -nxy energies.dat} Observe y trate de entender las amplitudes de las oscilaciones de las energías cinética y potencial, y las amplitudes de las oscilaciones de la energía total. A que se deben cada una de las oscilaciones? Observe como estas oscilaciones dependen del paso de integración.","category":"page"},{"location":"simple/","page":"Simulación microcanónica","title":"Simulación microcanónica","text":"Por fin, visualice la trayectoria, usando \\command{vmd -e view.vmd} Dentro de VMD, dé el comando  \\command{pbc set { 100. 100. 100. } -all} y represente explícitamente el sistema periódico eligiendo {\\tt +X;+Y;-X;-Y} en \\command{GraphicstoRepresentationstoPeriodic}","category":"page"},{"location":"#Fundamentos-de-Mecánica-Estadística-y-Simulaciones","page":"Início","title":"Fundamentos de Mecánica Estadística y Simulaciones","text":"","category":"section"},{"location":"","page":"Início","title":"Início","text":"<center>\nLeandro Martínez\n<br>\n<i>Instituto de Quimica, Universidad de Campinas</i>\n<br>\n<a href=http://m3g.iqm.unicamp.br>http://m3g.iqm.unicamp.br</a>\n<br>\n<br>\n</center>","category":"page"},{"location":"","page":"Início","title":"Início","text":"Este tutorial contiene las explicaciones para rodar y analizar simulaciones de Dinámica Molecular y Mote-Carlo de un sistema bi-dimensional simple. El objetivo es que el estudiante entre en contacto con diversos detalles técnicos involucrados en la realización de simulaciones y sus limitaciones. ","category":"page"},{"location":"#.1.-Instalación-de-CELFI.jl","page":"Início","title":"1.1. Instalación de CELFI.jl","text":"","category":"section"},{"location":"","page":"Início","title":"Início","text":"Instale el interpretador de Julia, de https://julialang.org/.","category":"page"},{"location":"","page":"Início","title":"Início","text":"Ejecute el interpretador, e instale el paquete deste curso, usando: ","category":"page"},{"location":"","page":"Início","title":"Início","text":"julia> ] add https://github.com/m3g/CELFI.jl","category":"page"},{"location":"","page":"Início","title":"Início","text":"(el ] te llevará al prompt the gerenciamento de paquetes, \"(@v1.6) pkg>\", donde debe ser ejecutado el add ...)","category":"page"},{"location":"","page":"Início","title":"Início","text":"Instale también el paquete Plots, que va a ser usado para graficar algunos resultados:","category":"page"},{"location":"","page":"Início","title":"Início","text":"julia> ] add Plots","category":"page"},{"location":"#.2.-Instalación-de-VMD","page":"Início","title":"1.2. Instalación de VMD","text":"","category":"section"},{"location":"","page":"Início","title":"Início","text":"Usaremos VMD para visualización de las trajectories. Certifique-se de tenerlo instalado también.","category":"page"},{"location":"#.3.-Códigos","page":"Início","title":"1.3. Códigos","text":"","category":"section"},{"location":"","page":"Início","title":"Início","text":"Julia es un lenguage de programación de alta peformance, dinámico, y con sintaxis bastante simple. Todos los códigos de este curso están disponíbles en repositório  https://github.com/m3g/CELFI.jl, y su lectura será estimulada en la medida que avanzemos en la ejecución del tutorial. ","category":"page"},{"location":"","page":"Início","title":"Início","text":"Los códigos aqui son razonablemente eficientes para al realización del tutorial, pero no están optimizados para máxima peformance, para que su lectura sea más fácil. ","category":"page"}]
}
