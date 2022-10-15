import { Component, OnInit } from "@angular/core";
import {  FormGroup, FormControl, FormBuilder, Validators } from "@angular/forms";
import { Articulo } from "../../models/articulo";
import { ArticuloFamilia } from "../../models/articulo-familia";
import { ArticulosService } from "../../services/articulos.service";
import { ModalDialogService } from "../../services/modal-dialog.service"
import { MockArticulosFamiliasService } from "../../services/mock-articulos-familias.service";
 
@Component({
  selector: "app-articulos",
  templateUrl: "./articulos.component.html",
  styleUrls: ["./articulos.component.css"]
})
export class ArticulosComponent implements OnInit {
  constructor(
    private articulosService: ArticulosService,
    private articulosFamiliasService: MockArticulosFamiliasService,
    private modalDialogService: ModalDialogService,
  ) {}

  Titulo = "Articulos";

  FormBusqueda = new FormGroup({
    Nombre: new FormControl(null),
    Activo: new FormControl(null),
  });
  
  FormRegistro = new FormGroup({
    IdArticulo: new FormControl(0),
    Nombre: new FormControl('', [Validators.required, Validators.minLength(4), Validators.maxLength(55)]),
    Precio: new FormControl(null, [Validators.required, Validators.pattern('[0-9]{1,7}')]),
    Stock: new FormControl(null, [Validators.required, Validators.pattern('[0-9]{1,7}')]),
    CodigoDeBarra: new FormControl ('', [Validators.required]),
    IdArticuloFamilia: new FormControl(0, [Validators.required]),
    FechaAlta: new FormControl('', [Validators.required, Validators.pattern('(0[1-9]|[12][0-9]|3[01])[-/](0[1-9]|1[012])[-/](19|20)[0-9]{2}')]),
    Activo: new FormControl(true),
  });

  isFormSubmitted = false;

  TituloAccionABMC : { [index: string]: string } = {
    A: "(Agregar)",
    B: "(Eliminar)",
    M: "(Modificar)",
    C: "(Consultar)",
    L: "(Listado)"
  };
  AccionABMC : string = "L" // inicia en el listado de articulos (buscar con parametros)
 
  Mensajes = {
    SD: " No se encontraron registros...",
    RD: " Revisar los datos ingresados..."
  };
 
  Items: Articulo[]|null = null;
  RegistrosTotal: number = 1;
  Familias: ArticuloFamilia[]|null = null;
  Pagina = 1; // inicia pagina 1
 
  // opciones del combo activo
  OpcionesActivo = [
    { Id: null, Nombre: "" },
    { Id: true, Nombre: "SI" },
    { Id: false, Nombre: "NO" }
  ];
 
 
  ngOnInit() {
    this.GetFamiliasArticulos();
  }
 
  GetFamiliasArticulos() {
    this.articulosFamiliasService.get().subscribe((res: ArticuloFamilia[]) => {
       this.Familias = res;
    });
  }
 
  Agregar() {
    this.AccionABMC = "A";
    this.FormRegistro.reset({ Activo: true, IdArticulo: 0 });
    this.isFormSubmitted = false;
  }

  Buscar() {
    this.articulosService
      .get(this.FormBusqueda.value.Nombre, this.FormBusqueda.value.Activo, this.Pagina)
      .subscribe((res: any) => {
        this.Items = res.Items;
        this.RegistrosTotal = res.RegistrosTotal;
      });
  }

  // Obtengo un registro especifico según el Id
  BuscarPorId(Item:Articulo, AccionABMC:string ) {
 
    window.scroll(0, 0); // ir al incio del scroll
 
    this.articulosService.getById(Item.IdArticulo).subscribe((res: any) => {
  
      const itemCopy = { ...res };  // hacemos copia para no modificar el array original del mock
      
      //formatear fecha de  ISO 8601 a string dd/MM/yyyy
      var arrFecha = itemCopy.FechaAlta.substr(0, 10).split("-");
      itemCopy.FechaAlta = arrFecha[2] + "/" + arrFecha[1] + "/" + arrFecha[0];
 
      this.FormRegistro.patchValue(itemCopy);
      this.AccionABMC = AccionABMC;
    });
  }

  Consultar(Item:Articulo) {
    this.BuscarPorId(Item, "C");
  }
 
  // comienza la modificacion, luego la confirma con el metodo Grabar
  Modificar(Item:Articulo) {
    if (!Item.Activo) {
      alert("No puede modificarse un registro Inactivo.");
      return;
    }
    this.BuscarPorId(Item, "M");
    this.isFormSubmitted = false;
  }
 
// grabar tanto altas como modificaciones
Grabar() {
  if (this.FormRegistro.invalid) {
    return;
  }
  
  const article: Articulo = {
    IdArticulo: this.FormRegistro.value.IdArticulo,
    Nombre: this.FormRegistro.value.Nombre,
    Activo: this.FormRegistro.value.Activo,
    Precio: this.FormRegistro.value.Precio,
    Stock: this.FormRegistro.value.Stock,
    CodigoDeBarra: this.FormRegistro.value.CodigoDeBarra,
    IdArticuloFamilia: this.FormRegistro.value.IdArticuloFamilia,
    FechaAlta: this.FormRegistro.value.FechaAlta,
    CantidadCaracteresNombre: 0
  };
  
  var arrFecha = article.FechaAlta.substring(0, 10).split("/");
  if (arrFecha.length == 3)
  article.FechaAlta = 
        new Date(
          parseInt(arrFecha[2]),
          parseInt(arrFecha[1])- 1,
          parseInt(arrFecha[0])
        ).toISOString();

  if (this.AccionABMC == "A") {
    this.articulosService.post(article).subscribe((res: any) => {
      this.Volver();
      alert('Registro agregado correctamente.');
      this.isFormSubmitted = true;
      this.Buscar();
    });
  } else {
    this.articulosService
      .put(article.IdArticulo, article)
      .subscribe((res: any) => {
        this.Volver();
        alert('Registro modificado correctamente.');
        this.isFormSubmitted = true;
        this.Buscar();
      });
  }
}

GetArticuloFamiliaNombre(Id:number) {
  let Nombre = this.Familias.find(x => x.IdArticuloFamilia === Id)?.Nombre;
  return Nombre;
}

ActivarDesactivar(Item:Articulo) {
  this.modalDialogService.Confirm(
    "Esta seguro de " +
      (Item.Activo ? "desactivar" : "activar") +
      " este registro?",
    undefined,
    undefined,
    undefined,
    () =>
      this.articulosService  
        .delete(Item.IdArticulo)
        .subscribe((res: any) => 
          this.Buscar()
        ),
    null
  );
}
 
  // Volver desde Agregar/Modificar
  Volver() {
    this.AccionABMC = "L";
  }
 
  ImprimirListado() {
    alert('Sin desarrollar...');
  }
 
}
