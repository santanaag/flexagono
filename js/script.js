/*
  Projeto: Gerador de Hexahexaflexágono
  Autor: Adriano S.
  Ano: 2026

  Licença: GPL-3.0

  Descrição:
  Funções para manipulação de imagens em canvas,
  recorte triangular e geração de PDF.

  Dependências:
  - jsPDF
*/

let imagens = [];

// Teste para verificação de imagem
let imagemGerada = false;

// Vérices do hexágono
const pontos = [
  [0, -1],
  [ Math.sqrt(3)/2, -1/2],
  [ Math.sqrt(3)/2,  1/2],
  [0, 1],
  [-Math.sqrt(3)/2,  1/2],
  [-Math.sqrt(3)/2, -1/2],
];

// Canvas para gerar um triângulo
let canvasF = document.getElementById("canvasF");
let ctxF = canvasF.getContext("2d");
//ctxF.clearRect(0, 0, canvasF.width, canvasF.height);

// Fazendo teste com imagem não carregada
let canvasV = document.getElementById("canvasV");
let ctxV = canvasV.getContext("2d");
//ctxV.clearRect(0, 0, canvasV.width, canvasV.height);


/*
                    Imagens Mosáico
*/

document.getElementById("upload").addEventListener("change", function() {
  const files = Array.from(this.files).slice(0, 6);

  // RESET TOTAL
  imagens = files;
  limparTabela();
  mostrarNomes();
  atualizarSelects();
});

function limparTabela() {
  for (let i = 1; i <= 6; i++) {
    const select = document.getElementById("f" + i);
    select.innerHTML = "";
  }
}

function mostrarNomes() {
  const lista = document.getElementById("listaImagens");
  const gridDiv = document.getElementById("gridImagens");

  // lista de nomes
  lista.innerHTML = "<strong>Imagens carregadas:</strong><br>";

  imagens.forEach((file, index) => {
    lista.innerHTML += `img${index+1}: ${file.name}<br>`;
  });

  // grid
  gridDiv.innerHTML = '<div class="grid" id="grid"></div>';
  const grid = document.getElementById("grid");

	for (let i = 0; i < 6; i++) {
	  const cell = document.createElement("div");
	  cell.style.position = "relative";
	  cell.style.width = "120px";
	  cell.style.height = "120px";

	  if (imagens[i]) {
		const img = document.createElement("img");
		img.src = URL.createObjectURL(imagens[i]);
		img.style.width = "100%";
		img.style.height = "100%";
		img.style.objectFit = "cover";

		const canvas = document.createElement("canvas");
		canvas.width = 120;
		canvas.height = 120;
		canvas.style.position = "absolute";
		canvas.style.top = "0";
		canvas.style.left = "0";

		img.onload = () => desenharHex(canvas);

		cell.appendChild(img);
		cell.appendChild(canvas);

	  } else {
		const placeholder = document.createElement("div");
		placeholder.style.width = "100%";
		placeholder.style.height = "100%";
		placeholder.style.border = "1px dashed #555";
		placeholder.style.background = "#111";
		cell.appendChild(placeholder);
	  }

	  grid.appendChild(cell);
	}
}

function desenharHex(canvas) {
  const ctx = canvas.getContext("2d");

  const w = canvas.width;
  const h = canvas.height;

  const cx = w / 2;
  const cy = h / 2;
  const r = h / 2;

  // converter para canvas
  const pts = pontos.map(p => [
    cx + p[0]*r,
    cy + p[1]*r
  ]);

  // contorno do hexágono
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < 6; i++) {
    ctx.lineTo(pts[i][0], pts[i][1]);
  }
  ctx.closePath();
  ctx.strokeStyle = "white";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // linhas internas (triângulos)
  for (let i = 0; i < 6; i++) {
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.strokeStyle = "red";
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}

function atualizarSelects() {
  const total = imagens.length;

  for (let i = 1; i <= 6; i++) {
    const select = document.getElementById("f" + i);

    // limpar (segurança extra, caso esqueça em outro lugar)
    select.innerHTML = "";

    // criar opções com índice correto (0-based)
    for (let j = 0; j < total; j++) {
      const opt = document.createElement("option");
      opt.value = j;          // 🔥 índice real do array
      opt.textContent = j+1;  // mostrado pro usuário (1,2,3...)
      select.appendChild(opt);
    }

    // preenchimento automático
    if (total > 0) {
      if (i <= total) {
        select.value = i - 1;     // 🔥 agora usa índice correto
      } else {
        select.value = total - 1; // repete a última imagem
      }
    }
  }
}

/*
                    Função Desenhar Triângulo
*/
function desenharTriangulo(ctx, img, centro, raio, recorte, angulo) {
  //const img = new Image();
  //img.src = imgSrc;

  //img.onload = function() {

    // 🔹 Escala da imagem
    let iscale;
    if (img.height * (raio*Math.sqrt(3)/2) / img.width < raio) {
      iscale = raio / img.height;
    } else {
      iscale = (raio*Math.sqrt(3)/2) / img.width;
    }

    const w = img.width * iscale;
    const h = img.height * iscale;

    // 🔹 vértices do triângulo base
    const vertice = [
      [centro[0], centro[1]],
      [centro[0] + (raio/4)*Math.sqrt(3), centro[1] - raio/4],
      [centro[0] + (raio/4)*Math.sqrt(3), centro[1] + raio/4]
    ];

    ctx.save();

    // 🔹 Rotação do recorte
    ctx.translate(centro[0], centro[1]);
    ctx.rotate(-recorte * 60 * Math.PI / 180);
    ctx.translate(-centro[0], -centro[1]);

    // 🔹 Recorte triangular
    ctx.beginPath();
    ctx.moveTo(vertice[0][0], vertice[0][1]);
    ctx.lineTo(vertice[1][0], vertice[1][1]);
    ctx.lineTo(vertice[2][0], vertice[2][1]);
    ctx.closePath();
    ctx.clip();

    // 🔹 Rotação da imagem
    ctx.translate(centro[0], centro[1]);
    ctx.rotate(angulo*60 * Math.PI / 180);
    ctx.translate(-centro[0], -centro[1]);

    // 🔹 Desenhar imagem
    ctx.drawImage(img, centro[0] - w/2, centro[1] - h/2, w, h);

    ctx.restore();
  //};
}
/*
                    Função Desenhar Triângulo
*/
function desenharTrianguloPasta(ctx, imgSrc, centro, raio, recorte, angulo) {
  const img = new Image();
  img.src = imgSrc;

  img.onload = function() {

    // 🔹 Escala da imagem
    let iscale;
    if (img.height * (raio*Math.sqrt(3)/2) / img.width < raio) {
      iscale = raio / img.height;
    } else {
      iscale = (raio*Math.sqrt(3)/2) / img.width;
    }

    const w = img.width * iscale;
    const h = img.height * iscale;

    // 🔹 vértices do triângulo base
    const vertice = [
      [centro[0], centro[1]],
      [centro[0] + (raio/4)*Math.sqrt(3), centro[1] - raio/4],
      [centro[0] + (raio/4)*Math.sqrt(3), centro[1] + raio/4]
    ];

    ctx.save();

    // 🔹 Rotação do recorte
    ctx.translate(centro[0], centro[1]);
    ctx.rotate(-recorte * 60 * Math.PI / 180);
    ctx.translate(-centro[0], -centro[1]);

    // 🔹 Recorte triangular
    ctx.beginPath();
    ctx.moveTo(vertice[0][0], vertice[0][1]);
    ctx.lineTo(vertice[1][0], vertice[1][1]);
    ctx.lineTo(vertice[2][0], vertice[2][1]);
    ctx.closePath();
    ctx.clip();

    // 🔹 Rotação da imagem
    ctx.translate(centro[0], centro[1]);
    ctx.rotate(angulo*60 * Math.PI / 180);
    ctx.translate(-centro[0], -centro[1]);

    // 🔹 Desenhar imagem
    ctx.drawImage(img, centro[0] - w/2, centro[1] - h/2, w, h);

    ctx.restore();
  };
}

function carregarImagem(i, callback) {
  //const index = document.getElementById("f" + i).value;
  const file = imagens[document.getElementById("f" + i).value];

  if (!file) return; // mensagem aparecendo três vezes

  const img = new Image();
  img.onload = () => callback(img);
  img.src = URL.createObjectURL(file);
}

function gradeDeTriangulos(ctx,unit,unith,cor,espessura){
	ctx.save();
	ctx.beginPath();			// começa o desenho
	for (let i = 0; i <= 4; i++) {
		ctx.moveTo(0     , 0+i*unith);		// posiciona o lapis
		ctx.lineTo(2*unit, unith+i*unith);	// risca até aqui em linha reta
		ctx.moveTo(2*unit, 0+i*unith);		// posiciona o lapis
		ctx.lineTo(     0, unith+i*unith);	// risca até aqui em linha reta
	}
	ctx.moveTo(     0, 5*unith);		// posiciona o lapis
	ctx.lineTo(  unit, 5.5*unith);	// risca até aqui em linha reta
	ctx.moveTo(2*unit, 5*unith);		// posiciona o lapis
	ctx.lineTo(  unit, 5.5*unith);	// risca até aqui em linha reta
	ctx.moveTo(     0,0.0*unith);		// posiciona o lapis
	ctx.lineTo(     0,5.0*unith);	// risca até aqui em linha reta
	ctx.moveTo(  unit,0.5*unith);		// posiciona o lapis
	ctx.lineTo(  unit,5.5*unith);	// risca até aqui em linha reta
	ctx.moveTo(2*unit,0.0*unith);		// posiciona o lapis
	ctx.lineTo(2*unit,5.0*unith);	// risca até aqui em linha reta

	ctx.strokeStyle = cor;   // cor da linha
	ctx.lineWidth = espessura;         // espessura
	ctx.stroke();				// desenha a figura
	ctx.restore();
}

function processar() {
  if (imagens.length === 0) {
    alert("Selecione pelo menos uma imagem!");
    return;
  }
  
  ctxF.clearRect(0, 0, canvasF.width, canvasF.height);
  ctxV.clearRect(0, 0, canvasV.width, canvasV.height);
  
  const unit = canvasF.width/2;
	const unith = 2*unit/Math.sqrt(3);
  // triângulos 1,4,7,10,13,16 → imagem 1
  carregarImagem(1, img => {
    desenharTriangulo(ctxF, img, [     0, 1.0 * unith], 2 * unith, 1, 1);
    desenharTriangulo(ctxF, img, [2*unit, 4.0 * unith], 2 * unith, 2, 2);
    desenharTriangulo(ctxF, img, [  unit, 2.5 * unith], 2 * unith, 1, 3);
    desenharTriangulo(ctxF, img, [2*unit, 1.0 * unith], 2 * unith, 2, 4);
    desenharTriangulo(ctxF, img, [     0, 4.0 * unith], 2 * unith, 1, 5);
    desenharTriangulo(ctxF, img, [  unit, 2.5 * unith], 2 * unith, 2, 6);
    imagemGerada = true;
  });
  // triângulos 3,6,9,12,15,18 → imagem 3
  carregarImagem(3, img => {
    desenharTriangulo(ctxF, img, [     0, 1.0 * unith], 2 * unith, 5, 1);
    desenharTriangulo(ctxF, img, [2*unit, 4.0 * unith], 2 * unith, 4, 2);
    desenharTriangulo(ctxF, img, [  unit, 2.5 * unith], 2 * unith, 5, 3);
    desenharTriangulo(ctxF, img, [2*unit, 1.0 * unith], 2 * unith, 4, 4);
    desenharTriangulo(ctxF, img, [     0, 4.0 * unith], 2 * unith, 5, 5);
    desenharTriangulo(ctxF, img, [  unit, 2.5 * unith], 2 * unith, 4, 6);
  });
  // triângulos 2,5,8,11,14,17 → imagem 5
  carregarImagem(5, img => {
    desenharTriangulo(ctxF, img, [     0, 1.0 * unith], 2 * unith, 0, 1);
    desenharTriangulo(ctxF, img, [2*unit, 4.0 * unith], 2 * unith, 3, 2);
    desenharTriangulo(ctxF, img, [  unit, 2.5 * unith], 2 * unith, 0, 3);
    desenharTriangulo(ctxF, img, [2*unit, 1.0 * unith], 2 * unith, 3, 4);
    desenharTriangulo(ctxF, img, [     0, 4.0 * unith], 2 * unith, 0, 5);
    desenharTriangulo(ctxF, img, [  unit, 2.5 * unith], 2 * unith, 3, 6);
  });
  gradeDeTriangulos(ctxF,unit,unith,"red",1);
  
  // triângulos 1,4,7,10,13,16 → imagem 2
  carregarImagem(2, img => {
    desenharTriangulo(ctxV, img, [     0, 2.0 * unith], 2 * unith, 0, 1);
    desenharTriangulo(ctxV, img, [     0, 2.0 * unith], 2 * unith, 1, 2);
    desenharTriangulo(ctxV, img, [  unit, 3.5 * unith], 2 * unith, 0, 3);
    desenharTriangulo(ctxV, img, [  unit, 3.5 * unith], 2 * unith, 1, 4);
    desenharTriangulo(ctxV, img, [     0, 5.0 * unith], 2 * unith, 0, 5);
    desenharTriangulo(ctxV, img, [     0, 5.0 * unith], 2 * unith, 1, 6);
  });

  // triângulos 2,5,8,11,14,17 → imagem 4
  carregarImagem(4, img => {
    desenharTriangulo(ctxV, img, [  unit, 2.5 * unith], 2 * unith, 0, 1);
    desenharTriangulo(ctxV, img, [  unit, 2.5 * unith], 2 * unith, 1, 2);
    desenharTriangulo(ctxV, img, [     0, 4.0 * unith], 2 * unith, 0, 3);
    desenharTriangulo(ctxV, img, [     0, 4.0 * unith], 2 * unith, 1, 4);
    desenharTriangulo(ctxV, img, [     0, 1.0 * unith], 2 * unith, 0, 5);
    desenharTriangulo(ctxV, img, [  unit, 5.5 * unith], 2 * unith, 1, 6);
  });//*/

  // triângulos 3,6,9,12,15,18 → imagem 6
  carregarImagem(6, img => {
    desenharTriangulo(ctxV, img, [  unit, 1.5 * unith], 2 * unith, 0, 1);
    desenharTriangulo(ctxV, img, [  unit, 1.5 * unith], 2 * unith, 1, 2);
    desenharTriangulo(ctxV, img, [     0, 3.0 * unith], 2 * unith, 0, 3);
    desenharTriangulo(ctxV, img, [     0, 3.0 * unith], 2 * unith, 1, 4);
    desenharTriangulo(ctxV, img, [  unit, 4.5 * unith], 2 * unith, 0, 5);
    desenharTriangulo(ctxV, img, [  unit, 4.5 * unith], 2 * unith, 1, 6);
  });//*/
  gradeDeTriangulos(ctxV,unit,unith,"red",1);

}

function processarTeste() {
  
  ctxF.clearRect(0, 0, canvasF.width, canvasF.height);
  ctxV.clearRect(0, 0, canvasV.width, canvasV.height);
  
  const unit = canvasF.width/2;
	const unith = 2*unit/Math.sqrt(3);
	
	// triângulos 1,4,7,10,13,16 → imagem 1
    desenharTrianguloPasta(ctxF, "assets/img/img1.png", [     0, 1.0 * unith], 2 * unith, 1, 1);
    desenharTrianguloPasta(ctxF, "assets/img/img1.png", [2*unit, 4.0 * unith], 2 * unith, 2, 2);
    desenharTrianguloPasta(ctxF, "assets/img/img1.png", [  unit, 2.5 * unith], 2 * unith, 1, 3);
    desenharTrianguloPasta(ctxF, "assets/img/img1.png", [2*unit, 1.0 * unith], 2 * unith, 2, 4);
    desenharTrianguloPasta(ctxF, "assets/img/img1.png", [     0, 4.0 * unith], 2 * unith, 1, 5);
    desenharTrianguloPasta(ctxF, "assets/img/img1.png", [  unit, 2.5 * unith], 2 * unith, 2, 6);
  // triângulos 3,6,9,12,15,18 → imagem 3
    desenharTrianguloPasta(ctxF, "assets/img/img3.png", [     0, 1.0 * unith], 2 * unith, 5, 1);
    desenharTrianguloPasta(ctxF, "assets/img/img3.png", [2*unit, 4.0 * unith], 2 * unith, 4, 2);
    desenharTrianguloPasta(ctxF, "assets/img/img3.png", [  unit, 2.5 * unith], 2 * unith, 5, 3);
    desenharTrianguloPasta(ctxF, "assets/img/img3.png", [2*unit, 1.0 * unith], 2 * unith, 4, 4);
    desenharTrianguloPasta(ctxF, "assets/img/img3.png", [     0, 4.0 * unith], 2 * unith, 5, 5);
    desenharTrianguloPasta(ctxF, "assets/img/img3.png", [  unit, 2.5 * unith], 2 * unith, 4, 6);
  // triângulos 2,5,8,11,14,17 → imagem 5
    desenharTrianguloPasta(ctxF, "assets/img/img5.png", [     0, 1.0 * unith], 2 * unith, 0, 1);
    desenharTrianguloPasta(ctxF, "assets/img/img5.png", [2*unit, 4.0 * unith], 2 * unith, 3, 2);
    desenharTrianguloPasta(ctxF, "assets/img/img5.png", [  unit, 2.5 * unith], 2 * unith, 0, 3);
    desenharTrianguloPasta(ctxF, "assets/img/img5.png", [2*unit, 1.0 * unith], 2 * unith, 3, 4);
    desenharTrianguloPasta(ctxF, "assets/img/img5.png", [     0, 4.0 * unith], 2 * unith, 0, 5);
    desenharTrianguloPasta(ctxF, "assets/img/img5.png", [  unit, 2.5 * unith], 2 * unith, 3, 6);
  
  // triângulos 1,4,7,10,13,16 → imagem 2
    desenharTrianguloPasta(ctxV, "assets/img/img2.png", [     0, 2.0 * unith], 2 * unith, 0, 1);
    desenharTrianguloPasta(ctxV, "assets/img/img2.png", [     0, 2.0 * unith], 2 * unith, 1, 2);
    desenharTrianguloPasta(ctxV, "assets/img/img2.png", [  unit, 3.5 * unith], 2 * unith, 0, 3);
    desenharTrianguloPasta(ctxV, "assets/img/img2.png", [  unit, 3.5 * unith], 2 * unith, 1, 4);
    desenharTrianguloPasta(ctxV, "assets/img/img2.png", [     0, 5.0 * unith], 2 * unith, 0, 5);
    desenharTrianguloPasta(ctxV, "assets/img/img2.png", [     0, 5.0 * unith], 2 * unith, 1, 6);

  // triângulos 2,5,8,11,14,17 → imagem 
    desenharTrianguloPasta(ctxV, "assets/img/img4.png", [  unit, 2.5 * unith], 2 * unith, 0, 1);
    desenharTrianguloPasta(ctxV, "assets/img/img4.png", [  unit, 2.5 * unith], 2 * unith, 1, 2);
    desenharTrianguloPasta(ctxV, "assets/img/img4.png", [     0, 4.0 * unith], 2 * unith, 0, 3);
    desenharTrianguloPasta(ctxV, "assets/img/img4.png", [     0, 4.0 * unith], 2 * unith, 1, 4);
    desenharTrianguloPasta(ctxV, "assets/img/img4.png", [     0, 1.0 * unith], 2 * unith, 0, 5);
    desenharTrianguloPasta(ctxV, "assets/img/img4.png", [  unit, 5.5 * unith], 2 * unith, 1, 6);

  // triângulos 3,6,9,12,15,18 → imagem 6
    desenharTrianguloPasta(ctxV, "assets/img/img6.png", [  unit, 1.5 * unith], 2 * unith, 0, 1);
    desenharTrianguloPasta(ctxV, "assets/img/img6.png", [  unit, 1.5 * unith], 2 * unith, 1, 2);
    desenharTrianguloPasta(ctxV, "assets/img/img6.png", [     0, 3.0 * unith], 2 * unith, 0, 3);
    desenharTrianguloPasta(ctxV, "assets/img/img6.png", [     0, 3.0 * unith], 2 * unith, 1, 4);
    desenharTrianguloPasta(ctxV, "assets/img/img6.png", [  unit, 4.5 * unith], 2 * unith, 0, 5);
    desenharTrianguloPasta(ctxV, "assets/img/img6.png", [  unit, 4.5 * unith], 2 * unith, 1, 6);
	imagemGerada = true;

	
  gradeDeTriangulos(ctxF,unit,unith,"black",5);
  gradeDeTriangulos(ctxV,unit,unith,"black",5);
  
}

function baixarPDFum() {
  if (!imagemGerada) {
    alert("Gere a imagem primeiro!");
    return;
  }

  const { jsPDF } = window.jspdf;

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  const pageWidth = 210;
  const pageHeight = 297;

  const imgDataF = canvasF.toDataURL("image/png");
  const imgDataV = canvasV.toDataURL("image/png");

  // ⚠️ escala correta
  const margemVertical = 15; // mm
	const margemHorizontal = 10; // opcional

	const areaWidth = pageWidth - 2*margemHorizontal;
	const areaHeight = pageHeight - 2*margemVertical;
	
	const escala = Math.min(
		(areaWidth/2) / canvasF.width,
		areaHeight / canvasF.height
	);

  const imgWidth = canvasF.width * escala;
  const imgHeight = canvasF.height * escala;

  const x = (pageWidth - 2*imgWidth) / 2;
	const y = (pageHeight - imgHeight) / 2;

  pdf.addImage(imgDataF, "PNG", x, y, imgWidth, imgHeight);
  pdf.addImage(imgDataV, "PNG", x + imgWidth, y, imgWidth, imgHeight);

  pdf.save("flexagono_lado_a_lado.pdf");
}

function baixarPDFfv() {
  if (!imagemGerada) {
    alert("Gere a imagem primeiro!");
    return;
  }

  const { jsPDF } = window.jspdf;

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  const pageWidth = 210;
  const pageHeight = 297;

  const margemVertical = 15;
  const margemHorizontal = 10;

  const areaWidth = pageWidth - 2*margemHorizontal;
  const areaHeight = pageHeight - 2*margemVertical;

  const escala = Math.min(
    areaWidth / canvasF.width,
    areaHeight / canvasF.height
  );

  const imgWidth = canvasF.width * escala;
  const imgHeight = canvasF.height * escala;

  const x = (pageWidth - imgWidth) / 2;
  const y = (pageHeight - imgHeight) / 2;

  const imgDataF = canvasF.toDataURL("image/png");
  const imgDataV = canvasV.toDataURL("image/png");

  pdf.addImage(imgDataF, "PNG", x, y, imgWidth, imgHeight);

  pdf.addPage();
  pdf.addImage(imgDataV, "PNG", x, y, imgWidth, imgHeight);

  pdf.save("flexagono_frente_verso.pdf");
}
