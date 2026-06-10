/* ==========================================
   FINANCIAL ENGINE & INTERACTIVE LOGIC
   ========================================== */

document.addEventListener("DOMContentLoaded", () => {
    // STATE VARIABLES
    let currentTab = "tab-negocio";
    let viewMode = "mensual"; // 'mensual' or 'anual'
    let chartMode = "utilidad"; // 'utilidad' or 'dinero'

    // DOM ELEMENTS - TABS
    const tabBtns = document.querySelectorAll(".tab-btn");
    const tabContents = document.querySelectorAll(".tab-content");

    // DOM ELEMENTS - INPUTS
    const inputs = {
        cuota: document.getElementById("input-cuota"),
        sliderCuota: document.getElementById("slider-cuota"),
        motos: document.getElementById("input-motos"),
        sliderMotos: document.getElementById("slider-motos"),
        multiplier: document.getElementById("input-multiplier"),
        sliderMultiplier: document.getElementById("slider-multiplier"),
        
        percentAnticipo: document.getElementById("percent-anticipo"),
        percentProvision: document.getElementById("percent-provision"),
        percentArrendamiento: document.getElementById("percent-arrendamiento"),
        
        honorarios: document.getElementById("input-honorarios"),
        sliderHonorarios: document.getElementById("slider-honorarios"),
        mantenimiento: document.getElementById("input-mantenimiento"),
        sliderMantenimiento: document.getElementById("slider-mantenimiento"),
        
        smmlv: document.getElementById("input-smmlv"),
        auxTrans: document.getElementById("input-auxtrans"),
        numEmpleados: document.getElementById("input-num-empleados"),
        sliderNumEmpleados: document.getElementById("slider-num-empleados"),
        pnNominaAdj: document.getElementById("input-pn-nomina-adj"),
        sliderPnNominaAdj: document.getElementById("slider-pn-nomina-adj"),
        empresaNominaAdj: document.getElementById("input-empresa-nomina-adj"),
        sliderEmpresaNominaAdj: document.getElementById("slider-empresa-nomina-adj"),
        
        icaRate: document.getElementById("input-ica-rate"),
        ivaRate: document.getElementById("input-iva-rate"),
        ivaThreshold: document.getElementById("input-iva-threshold"),
        rentaEmpresaRate: document.getElementById("input-renta-empresa-rate"),
        rentaPnExento: document.getElementById("input-renta-pn-exento"),
        rentaPnLimit: document.getElementById("input-renta-pn-bracket-limit"),
        
        creditoMensual: document.getElementById("input-credito-mensual"),
        sliderCreditoMensual: document.getElementById("slider-credito-mensual"),
        creditoMeses: document.getElementById("input-credito-meses"),
        sliderCreditoMeses: document.getElementById("slider-credito-meses"),
        exonerado: document.getElementById("input-exonerado"),
        ivaIncluido: document.getElementById("input-iva-incluido"),
        uvt: document.getElementById("input-uvt"),
    };

    // MODAL ELEMENTS
    const modal = document.getElementById("payroll-modal");
    const btnShowModal = document.getElementById("btn-show-payroll-modal");
    const btnCloseModal = document.getElementById("btn-close-payroll-modal");

    const modalCells = {
        pnSalario: document.getElementById("modal-pn-salario"),
        empSalario: document.getElementById("modal-emp-salario"),
        pnAuxtrans: document.getElementById("modal-pn-auxtrans"),
        empAuxtrans: document.getElementById("modal-emp-auxtrans"),
        pnSalud: document.getElementById("modal-pn-salud"),
        empSalud: document.getElementById("modal-emp-salud"),
        descSalud: document.getElementById("modal-desc-salud"),
        pnPension: document.getElementById("modal-pn-pension"),
        empPension: document.getElementById("modal-emp-pension"),
        descPension: document.getElementById("modal-desc-pension"),
        empArl: document.getElementById("modal-emp-arl"),
        empCaja: document.getElementById("modal-emp-caja"),
        empParafiscales: document.getElementById("modal-emp-parafiscales"),
        descParafiscales: document.getElementById("modal-desc-parafiscales"),
        empPrima: document.getElementById("modal-emp-prima"),
        empCesantias: document.getElementById("modal-emp-cesantias"),
        empIntereses: document.getElementById("modal-emp-intereses"),
        empVacaciones: document.getElementById("modal-emp-vacaciones"),
        pnTotal: document.getElementById("modal-pn-total"),
        empTotal: document.getElementById("modal-emp-total")
    };

    // LABELS
    const labelAnticipo = document.getElementById("label-anticipo");
    const labelProvision = document.getElementById("label-provision");
    const labelArrendamiento = document.getElementById("label-arrendamiento");

    // VIEW TOGGLES
    const btnViewMensual = document.getElementById("btn-view-mensual");
    const btnViewAnual = document.getElementById("btn-view-anual");
    const btnChartUtilidad = document.getElementById("btn-chart-utilidad");
    const btnChartDinero = document.getElementById("btn-chart-dinero");

    // METRICS DISPLAYS
    const metrics = {
        pnUtilidad: document.getElementById("val-pn-utilidad"),
        pnDinero: document.getElementById("val-pn-dinero"),
        pnRenta: document.getElementById("footer-pn-renta"),
        pnIva: document.getElementById("footer-pn-iva"),
        
        empUtilidad: document.getElementById("val-emp-utilidad"),
        empDinero: document.getElementById("val-emp-dinero"),
        empRenta: document.getElementById("footer-emp-renta"),
        empIva: document.getElementById("footer-emp-iva"),
        
        eqMotosPn: document.getElementById("val-eq-motos-pn"),
        eqDescPn: document.getElementById("val-eq-desc-pn"),
        eqMotosEmp: document.getElementById("val-eq-motos-emp"),
        eqDescEmp: document.getElementById("val-eq-desc-emp"),
    };

    // TABLE BODY
    const tableBody = document.getElementById("table-body");

    // CHART ELEMENTS
    const svgChart = document.getElementById("equilibrium-chart");
    const pathPn = document.getElementById("path-pn");
    const pathEmp = document.getElementById("path-emp");
    const zeroLine = document.getElementById("zero-line");
    const hoverLine = document.getElementById("hover-line");
    const pointEqPn = document.getElementById("point-eq-pn");
    const pointEqEmp = document.getElementById("point-eq-emp");
    const chartLabelsX = document.getElementById("chart-labels-x");
    const chartLabelsY = document.getElementById("chart-labels-y");
    const chartGrid = document.getElementById("chart-grid");
    const chartTooltip = document.getElementById("chart-tooltip");



    // ----------------------------------------------------
    // INITIALIZATION & TAB BINDING
    // ----------------------------------------------------
    tabBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            tabBtns.forEach(b => b.classList.remove("active"));
            tabContents.forEach(c => c.classList.remove("active"));
            
            btn.classList.add("active");
            const target = btn.getAttribute("data-target");
            document.getElementById(target).classList.add("active");
            currentTab = target;
        });
    });

    // Sincronizar input número con slider range
    function syncInputs(numInput, sliderInput, callback) {
        if (!numInput || !sliderInput) return;
        
        numInput.addEventListener("input", (e) => {
            sliderInput.value = e.target.value;
            if (callback) callback();
            update();
        });
        
        sliderInput.addEventListener("input", (e) => {
            numInput.value = e.target.value;
            if (callback) callback();
            update();
        });
    }

    syncInputs(inputs.cuota, inputs.sliderCuota);
    syncInputs(inputs.motos, inputs.sliderMotos);
    syncInputs(inputs.multiplier, inputs.sliderMultiplier);
    syncInputs(inputs.honorarios, inputs.sliderHonorarios);
    syncInputs(inputs.mantenimiento, inputs.sliderMantenimiento);
    syncInputs(inputs.numEmpleados, inputs.sliderNumEmpleados);
    syncInputs(inputs.pnNominaAdj, inputs.sliderPnNominaAdj);
    syncInputs(inputs.empresaNominaAdj, inputs.sliderEmpresaNominaAdj);
    syncInputs(inputs.creditoMensual, inputs.sliderCreditoMensual);
    syncInputs(inputs.creditoMeses, inputs.sliderCreditoMeses);

    // Configurar otros inputs que no tienen sliders
    [inputs.smmlv, inputs.auxTrans, inputs.icaRate, inputs.ivaRate, inputs.ivaThreshold, inputs.rentaEmpresaRate].forEach(inp => {
        if (inp) inp.addEventListener("input", update);
    });

    if (inputs.exonerado) {
        inputs.exonerado.addEventListener("change", update);
    }

    if (inputs.ivaIncluido) {
        inputs.ivaIncluido.addEventListener("change", update);
    }

    if (inputs.uvt) {
        inputs.uvt.addEventListener("input", () => {
            const uvtVal = parseFloat(inputs.uvt.value) || 0;
            if (inputs.rentaPnExento) inputs.rentaPnExento.value = Math.round(1090 * uvtVal);
            if (inputs.rentaPnLimit) inputs.rentaPnLimit.value = Math.round(1700 * uvtVal);
            update();
        });
    }

    // Modal behavior
    if (btnShowModal && modal && btnCloseModal) {
        btnShowModal.addEventListener("click", () => {
            modal.style.display = "flex";
        });
        
        btnCloseModal.addEventListener("click", () => {
            modal.style.display = "none";
        });

        // Close when clicking outside card
        modal.addEventListener("click", (e) => {
            if (e.target === modal) {
                modal.style.display = "none";
            }
        });
    }

    // Distribución porcentual interactiva
    function handlePercentSliders() {
        const anticipoVal = parseInt(inputs.percentAnticipo.value);
        const provisionVal = parseInt(inputs.percentProvision.value);
        
        // El arrendamiento toma el remanente, limitado entre 0 y 100
        let arrendamientoVal = 100 - anticipoVal - provisionVal;
        
        if (arrendamientoVal < 0) {
            // Si supera el 100%, reajustamos el que se movió
            arrendamientoVal = 0;
            // Si el anticipo es el que sumó de más
            if (document.activeElement === inputs.percentAnticipo) {
                inputs.percentProvision.value = 100 - anticipoVal;
            } else {
                inputs.percentAnticipo.value = 100 - provisionVal;
            }
        }
        
        labelAnticipo.textContent = `${inputs.percentAnticipo.value}%`;
        labelProvision.textContent = `${inputs.percentProvision.value}%`;
        labelArrendamiento.textContent = `${100 - parseInt(inputs.percentAnticipo.value) - parseInt(inputs.percentProvision.value)}%`;
        inputs.percentArrendamiento.value = 100 - parseInt(inputs.percentAnticipo.value) - parseInt(inputs.percentProvision.value);
    }

    inputs.percentAnticipo.addEventListener("input", () => {
        handlePercentSliders();
        update();
    });
    inputs.percentProvision.addEventListener("input", () => {
        handlePercentSliders();
        update();
    });

    // View Toggles
    btnViewMensual.addEventListener("click", () => {
        btnViewMensual.classList.add("active");
        btnViewAnual.classList.remove("active");
        viewMode = "mensual";
        update();
    });
    
    btnViewAnual.addEventListener("click", () => {
        btnViewAnual.classList.add("active");
        btnViewMensual.classList.remove("active");
        viewMode = "anual";
        update();
    });

    btnChartUtilidad.addEventListener("click", () => {
        btnChartUtilidad.classList.add("active");
        btnChartDinero.classList.remove("active");
        chartMode = "utilidad";
        update();
    });

    btnChartDinero.addEventListener("click", () => {
        btnChartDinero.classList.add("active");
        btnChartUtilidad.classList.remove("active");
        chartMode = "dinero";
        update();
    });



    // ----------------------------------------------------
    // FORMATTING UTILS
    // ----------------------------------------------------
    function formatCurrency(val) {
        const rounded = Math.round(val);
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            maximumFractionDigits: 0
        }).format(rounded);
    }

    function parsePercent(val) {
        return parseFloat(val) / 100;
    }

    // ----------------------------------------------------
    // CALCULATOR ENGINE
    // ----------------------------------------------------
    function calculateFinancials(customMotos = null) {
        // Leer valores de los inputs
        const cuota = parseFloat(inputs.cuota.value) || 0;
        const motos = customMotos !== null ? customMotos : (parseFloat(inputs.motos.value) || 0);
        const multiplier = parseFloat(inputs.multiplier.value) || 1;
        
        const pctAnticipo = parsePercent(inputs.percentAnticipo.value);
        const pctProvision = parsePercent(inputs.percentProvision.value);
        const pctArrendamiento = 1 - pctAnticipo - pctProvision;
        
        const honorarios = parseFloat(inputs.honorarios.value) || 0;
        const mantenimiento = parseFloat(inputs.mantenimiento.value) || 0;
        
        const smmlv = parseFloat(inputs.smmlv.value) || 0;
        const auxTrans = parseFloat(inputs.auxTrans.value) || 0;
        const numEmpleados = Math.max(1, parseInt(inputs.numEmpleados.value) || 1);
        const pnNominaAdj = parseFloat(inputs.pnNominaAdj.value) || 0;
        const empresaNominaAdj = parseFloat(inputs.empresaNominaAdj.value) || 0;
        
        const icaRate = parsePercent(inputs.icaRate.value);
        const ivaRate = parsePercent(inputs.ivaRate.value);
        const ivaThreshold = parseFloat(inputs.ivaThreshold.value) || 0;
        const rentaEmpresaRate = parsePercent(inputs.rentaEmpresaRate.value);
        
        const uvtVal = parseFloat(inputs.uvt.value) || 52374;
        const rentaPnExento = 1090 * uvtVal;
        const rentaPnLimit = 1700 * uvtVal;
        
        const creditoMensual = parseFloat(inputs.creditoMensual.value) || 0;
        const creditoMeses = parseFloat(inputs.creditoMeses.value) || 12;
        
        const ivaIncluido = inputs.ivaIncluido ? inputs.ivaIncluido.checked : true;

        // --- INGRESOS BRUTOS ---
        const arrendamientoPorMoto = cuota * pctArrendamiento;
        const anticipoPorMoto = cuota * pctAnticipo;
        const provisionPorMoto = cuota * pctProvision;
        
        const ingresoCuotaMensualBruto = arrendamientoPorMoto * multiplier;
        const ingresoTotalMotosMensualBruto = ingresoCuotaMensualBruto * motos;
        const ingresoAnualBruto = ingresoTotalMotosMensualBruto * 12;

        // --- EXTRACCIÓN DE IVA & INGRESOS NETOS OPERACIONALES ---
        // La Empresa (S.A.S.) es siempre responsable de IVA.
        // La Persona Natural es responsable de IVA solo si sus ingresos anuales brutos superan el tope (ivaThreshold).
        const pnResponsableIva = ingresoAnualBruto > ivaThreshold;
        
        let ingresoAnualNetoPn = 0;
        let ivaAnualPn = 0;
        let ingresoAnualNetoEmp = 0;
        let ivaAnualEmp = 0;
        
        if (ivaIncluido) {
            // El precio de la cuota ya incluye el IVA
            ingresoAnualNetoEmp = ingresoAnualBruto / (1 + ivaRate);
            ivaAnualEmp = ingresoAnualBruto - ingresoAnualNetoEmp;
            
            if (pnResponsableIva) {
                ingresoAnualNetoPn = ingresoAnualBruto / (1 + ivaRate);
                ivaAnualPn = ingresoAnualBruto - ingresoAnualNetoPn;
            } else {
                ingresoAnualNetoPn = ingresoAnualBruto;
                ivaAnualPn = 0;
            }
        } else {
            // El precio de la cuota es más IVA (el cliente paga el IVA por encima)
            ingresoAnualNetoEmp = ingresoAnualBruto;
            ivaAnualEmp = ingresoAnualBruto * ivaRate;
            
            if (pnResponsableIva) {
                ingresoAnualNetoPn = ingresoAnualBruto;
                ivaAnualPn = ingresoAnualBruto * ivaRate;
            } else {
                ingresoAnualNetoPn = ingresoAnualBruto;
                ivaAnualPn = 0;
            }
        }
        
        const ingresoTotalMotosMensualNetoPn = ingresoAnualNetoPn / 12;
        const ingresoTotalMotosMensualNetoEmp = ingresoAnualNetoEmp / 12;

        // --- NÓMINA & SEGURIDAD SOCIAL ---
        // Persona Natural: Aportes de salud (12.5%) y pensión (16%) calculados sobre el IBC.
        // El IBC es el 40% del ingreso neto mensual del contratista independiente, con piso de 1 SMMLV y techo de 25 SMMLV.
        const ibcPn = ingresoTotalMotosMensualNetoPn > 0 
            ? Math.min(25 * smmlv, Math.max(smmlv, ingresoTotalMotosMensualNetoPn * 0.40)) 
            : 0;
        const saludPn = ibcPn * 0.125;
        const pensionPn = ibcPn * 0.16;
        // El costo de nómina de la persona natural son solo sus aportes directos, no el IBC completo.
        const totalNominaPnCalculada = saludPn + pensionPn;
        const nominaPnMensual = Math.max(0, totalNominaPnCalculada + pnNominaAdj);
        const nominaPnAnual = nominaPnMensual * 12;

        // Empresa (Cálculo Completo de Nómina Patronal con ARL, Caja y Prestaciones de Ley)
        const exonerado = inputs.exonerado ? inputs.exonerado.checked : true;
        const ibcEmp = smmlv;
        const basePrestaciones = smmlv + auxTrans;

        // Aportes de Seguridad Social y Parafiscales Patronales
        const saludEmp = exonerado ? 0 : (ibcEmp * 0.085); // Exento bajo Art. 114-1 ET (si no, 8.5%)
        const pensionEmp = ibcEmp * 0.12; // Aporte patronal es 12% (el 4% restante es del empleado)
        const arlEmp = ibcEmp * 0.00522; // Nivel I (0.522%)
        const cajaEmp = ibcEmp * 0.04; // Caja 4%
        const senaEmp = exonerado ? 0 : (ibcEmp * 0.02); // SENA 2% (exento bajo Art. 114-1 ET)
        const icbfEmp = exonerado ? 0 : (ibcEmp * 0.03); // ICBF 3% (exento bajo Art. 114-1 ET)
        const parafiscalesEmp = senaEmp + icbfEmp;

        // Provisiones Mensuales de Prestaciones Sociales
        const primaEmp = basePrestaciones * 0.0833; // Prima 8.33%
        const cesantiasEmp = basePrestaciones * 0.0833; // Cesantías 8.33%
        const interesesCesantiasEmp = basePrestaciones * 0.01; // Intereses sobre Cesantías 1% mensual (12% de las cesantías)
        const vacacionesEmp = ibcEmp * 0.0417; // Vacaciones 4.17% (sin Auxilio de Transporte)
        const prestacionesEmp = primaEmp + cesantiasEmp + interesesCesantiasEmp + vacacionesEmp;

        // Suma real de aportes Patronales + Salario + Auxilio de Transporte + Prestaciones (por empleado)
        const totalNominaEmpCalculada = ibcEmp + auxTrans + saludEmp + pensionEmp + arlEmp + cajaEmp + parafiscalesEmp + prestacionesEmp;
        // El ajuste es un monto fijo mensual adicional (no se multiplica por empleado)
        const nominaEmpMensual = Math.max(0, totalNominaEmpCalculada * numEmpleados + empresaNominaAdj);
        const nominaEmpAnual = nominaEmpMensual * 12;

        // --- IMPUESTOS MUNICIPALES (ICA) ---
        // El ICA se liquida sobre los ingresos operacionales netos (excluyendo el IVA recaudado).
        const icaAnualPn = ingresoAnualNetoPn * icaRate;
        const icaAnualEmp = ingresoAnualNetoEmp * icaRate;

        // Impuestos Totales Anuales (ICA en gastos; el IVA se deduce de los ingresos)
        const impuestosAnualesPn = icaAnualPn;
        const impuestosAnualesEmp = icaAnualEmp;

        const impuestosMensualesPn = impuestosAnualesPn / 12;
        const impuestosMensualesEmp = impuestosAnualesEmp / 12;

        // --- FLUJO DE CAJA POR ANTICIPOS & PROVISIÓN (Abonos directos de clientes) ---
        const flujoCajaMensual = (anticipoPorMoto + provisionPorMoto) * motos * multiplier;
        const flujoCajaAnual = flujoCajaMensual * 12;

        // --- GASTOS OPERATIVOS TOTALES (MENSUALES, Excluyendo Renta e IVA) ---
        const gastosMensualesPn = nominaPnMensual + honorarios + impuestosMensualesPn;
        const gastosMensualesEmp = nominaEmpMensual + honorarios + mantenimiento + impuestosMensualesEmp;
        
        const gastosAnualesPn = gastosMensualesPn * 12;
        const gastosAnualesEmp = gastosMensualesEmp * 12;

        // --- LIQUIDEZ MENSUAL (Flujo de efectivo operativo real, partiendo del Ingreso Neto Operacional) ---
        const liquidezMensualPn = ingresoTotalMotosMensualNetoPn - gastosMensualesPn - creditoMensual + flujoCajaMensual;
        const liquidezMensualEmp = ingresoTotalMotosMensualNetoEmp - gastosMensualesEmp - creditoMensual + flujoCajaMensual;

        // --- UTILIDAD ANTES DE RENTA (ANUAL) ---
        const utilidadAntesRentaPn = ingresoAnualNetoPn - gastosAnualesPn;
        const utilidadAntesRentaEmp = ingresoAnualNetoEmp - gastosAnualesEmp;

        // --- IMPUESTO DE RENTA (ANUAL - Lógica de tramos progresivos Art. 241 E.T. en UVT) ---
        // Persona Natural (Progresivo real de la DIAN)
        const baseUVT = utilidadAntesRentaPn > 0 ? (utilidadAntesRentaPn / uvtVal) : 0;
        let rentaUVT = 0;
        if (baseUVT > 1090) {
            if (baseUVT <= 1700) {
                rentaUVT = (baseUVT - 1090) * 0.19;
            } else if (baseUVT <= 4100) {
                rentaUVT = (baseUVT - 1700) * 0.28 + 116;
            } else if (baseUVT <= 8670) {
                rentaUVT = (baseUVT - 4100) * 0.33 + 788;
            } else if (baseUVT <= 18970) {
                rentaUVT = (baseUVT - 8670) * 0.35 + 2296;
            } else if (baseUVT <= 31000) {
                rentaUVT = (baseUVT - 18970) * 0.37 + 5901;
            } else {
                rentaUVT = (baseUVT - 31000) * 0.39 + 10352;
            }
        }
        const rentaPnAnual = Math.max(0, rentaUVT * uvtVal);

        // Empresa (Tarifa Plana sobre la utilidad neta antes de impuesto)
        const rentaEmpAnual = utilidadAntesRentaEmp > 0 ? (utilidadAntesRentaEmp * rentaEmpresaRate) : 0;

        // Renta Mensualizada (para fines informativos)
        const rentaMensualPn = rentaPnAnual / 12;
        const rentaMensualEmp = rentaEmpAnual / 12;

        // --- UTILIDAD NETA (TRIBUTARIA / CONTABLE) ---
        const utilidadNetaPn = utilidadAntesRentaPn - rentaPnAnual;
        const utilidadNetaEmp = utilidadAntesRentaEmp - rentaEmpAnual;

        // --- DEUDA ANUAL (Financiamiento) ---
        const creditoAnual = creditoMensual * creditoMeses;

        // --- EXCEDENTE DE CAJA FINAL (DINERO REAL) ---
        // Caja Final = Utilidad Neta - Amortización de Deuda + Aporte de Flujo de Caja (Anticipos/Provisión)
        const dineroPn = utilidadNetaPn - creditoAnual + flujoCajaAnual;
        const dineroEmp = utilidadNetaEmp - creditoAnual + flujoCajaAnual;

        return {
            ingresoTotalMotosMensual: ingresoTotalMotosMensualBruto,
            ingresoAnual: ingresoAnualBruto,
            arrendamientoPorMoto,
            anticipoPorMoto,
            provisionPorMoto,
            
            // Ingresos Netos
            ingresoTotalMotosMensualNetoPn,
            ingresoTotalMotosMensualNetoEmp,
            ingresoAnualNetoPn,
            ingresoAnualNetoEmp,
            pnResponsableIva,
            
            // Nómina
            ibc: ibcPn,
            saludPn,
            pensionPn,
            totalNominaPnCalculada,
            nominaPnMensual,
            nominaPnAnual,
            
            exonerado,
            numEmpleados,
            ibcEmp,
            saludEmp,
            pensionEmp,
            arlEmp,
            cajaEmp,
            senaEmp,
            icbfEmp,
            parafiscalesEmp,
            primaEmp,
            cesantiasEmp,
            interesesCesantiasEmp,
            vacacionesEmp,
            prestacionesEmp,
            totalNominaEmpCalculada,
            nominaEmpMensual,
            nominaEmpAnual,
            
            // Impuestos
            ivaAnualPn,
            ivaAnualEmp,
            icaAnualPn,
            icaAnualEmp,
            impuestosAnualesPn,
            impuestosAnualesEmp,
            impuestosMensualesPn,
            impuestosMensualesEmp,
            
            // Caja
            flujoCajaMensual,
            flujoCajaAnual,
            
            // Gastos Operativos
            gastosMensualesPn,
            gastosMensualesEmp,
            gastosAnualesPn,
            gastosAnualesEmp,
            
            // Liquidez
            liquidezMensualPn,
            liquidezMensualEmp,
            
            // Utilidad Renta
            utilidadAntesRentaPn,
            utilidadAntesRentaEmp,
            rentaPnAnual,
            rentaEmpAnual,
            rentaMensualPn,
            rentaMensualEmp,
            utilidadNetaPn,
            utilidadNetaEmp,
            
            // Deuda
            creditoMensual,
            creditoAnual,
            
            // Caja Final
            dineroPn,
            dineroEmp
        };
    }

    // ----------------------------------------------------
    // NUMERICAL SWEEP FOR BREAK-EVEN (PUNTO DE EQUILIBRIO)
    // ----------------------------------------------------
    function calculateBreakEvenPoint(type, field) {
        // Encontrar en qué cantidad de motos (entre 0 y 500) la métrica cruza cero
        let step = 0.1;
        let prevVal = null;
        let prevM = 0;
        
        for (let m = 0; m <= 500; m += step) {
            const f = calculateFinancials(m);
            let val;
            if (type === 'pn') {
                val = field === 'utilidad' ? f.utilidadNetaPn : f.dineroPn;
            } else {
                val = field === 'utilidad' ? f.utilidadNetaEmp : f.dineroEmp;
            }
            
            if (prevVal !== null && ((prevVal < 0 && val >= 0) || (prevVal > 0 && val <= 0))) {
                // Intersección encontrada: interpolación lineal simple para exactitud
                const ratio = Math.abs(prevVal) / (Math.abs(prevVal) + Math.abs(val));
                return prevM + ratio * step;
            }
            
            prevVal = val;
            prevM = m;
        }
        
        // Si no cruza, devolvemos 0 o null
        return 0;
    }

    // ----------------------------------------------------
    // CHART RENDERING (DYNAMIC SVG PATHS)
    // ----------------------------------------------------
    function renderChart() {
        const maxMotos = Math.max(100, Math.ceil(parseFloat(inputs.motos.value) * 1.5));
        
        // Sweep values to plot
        const points = [];
        let minY = 0;
        let maxY = 0;
        
        for (let m = 0; m <= maxMotos; m += Math.max(1, maxMotos / 20)) {
            const f = calculateFinancials(m);
            const valPn = chartMode === 'utilidad' ? f.utilidadNetaPn : f.dineroPn;
            const valEmp = chartMode === 'utilidad' ? f.utilidadNetaEmp : f.dineroEmp;
            
            points.push({ m, valPn, valEmp });
            
            minY = Math.min(minY, valPn, valEmp);
            maxY = Math.max(maxY, valPn, valEmp);
        }

        // Add some safety padding to Y limits
        minY = minY * 1.1 - 5000000;
        maxY = maxY * 1.1 + 5000000;
        
        // Chart coordinates
        const paddingLeft = 65;
        const paddingRight = 30;
        const paddingTop = 20;
        const paddingBottom = 40;
        
        const width = 600;
        const height = 300;
        
        const chartWidth = width - paddingLeft - paddingRight;
        const chartHeight = height - paddingTop - paddingBottom;
        
        // Coord convert functions
        function getX(m) {
            return paddingLeft + (m / maxMotos) * chartWidth;
        }
        
        function getY(val) {
            const pct = (val - minY) / (maxY - minY);
            return height - paddingBottom - pct * chartHeight;
        }

        // Draw Zero Line
        const yZero = getY(0);
        zeroLine.setAttribute("y1", yZero);
        zeroLine.setAttribute("y2", yZero);
        zeroLine.setAttribute("x1", paddingLeft);
        zeroLine.setAttribute("x2", width - paddingRight);

        // Draw Grid Lines & Labels
        chartGrid.innerHTML = "";
        chartLabelsX.innerHTML = "";
        chartLabelsY.innerHTML = "";
        
        // Y-axis grid & labels (4 lines)
        const ySteps = 4;
        for (let i = 0; i <= ySteps; i++) {
            const val = minY + (i / ySteps) * (maxY - minY);
            const y = getY(val);
            
            // Grid line
            const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
            line.setAttribute("x1", paddingLeft);
            line.setAttribute("y1", y);
            line.setAttribute("x2", width - paddingRight);
            line.setAttribute("y2", y);
            chartGrid.appendChild(line);
            
            // Label
            const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
            text.setAttribute("x", paddingLeft - 8);
            text.setAttribute("y", y + 4);
            text.textContent = (val / 1000000).toFixed(0) + "M";
            chartLabelsY.appendChild(text);
        }
        
        // X-axis labels (5 steps)
        const xSteps = 5;
        for (let i = 0; i <= xSteps; i++) {
            const m = (i / xSteps) * maxMotos;
            const x = getX(m);
            
            // Label
            const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
            text.setAttribute("x", x);
            text.setAttribute("y", height - paddingBottom + 18);
            text.textContent = Math.round(m).toString();
            chartLabelsX.appendChild(text);
        }

        // Generate detailed curve points for smooth line path
        let dPn = "";
        let dEmp = "";
        let dPnFill = "";
        let dEmpFill = "";
        
        const smoothSteps = 60;
        for (let i = 0; i <= smoothSteps; i++) {
            const m = (i / smoothSteps) * maxMotos;
            const f = calculateFinancials(m);
            
            const valPn = chartMode === 'utilidad' ? f.utilidadNetaPn : f.dineroPn;
            const valEmp = chartMode === 'utilidad' ? f.utilidadNetaEmp : f.dineroEmp;
            
            const x = getX(m);
            const yPn = getY(valPn);
            const yEmp = getY(valEmp);
            
            const prefix = i === 0 ? "M" : "L";
            dPn += `${prefix} ${x} ${yPn} `;
            dEmp += `${prefix} ${x} ${yEmp} `;
            
            if (i === 0) {
                dPnFill = `M ${x} ${yZero} L ${x} ${yPn} `;
                dEmpFill = `M ${x} ${yZero} L ${x} ${yEmp} `;
            } else {
                dPnFill += `L ${x} ${yPn} `;
                dEmpFill += `L ${x} ${yEmp} `;
            }
            
            if (i === smoothSteps) {
                dPnFill += `L ${x} ${yZero} Z`;
                dEmpFill += `L ${x} ${yZero} Z`;
            }
        }
        
        pathPn.setAttribute("d", dPn);
        pathEmp.setAttribute("d", dEmp);

        // Find Break-Even for charts
        const bePn = calculateBreakEvenPoint('pn', chartMode === 'utilidad' ? 'utilidad' : 'dinero');
        const beEmp = calculateBreakEvenPoint('emp', chartMode === 'utilidad' ? 'utilidad' : 'dinero');

        // Draw Break-even marker circles
        if (bePn > 0 && bePn <= maxMotos) {
            pointEqPn.setAttribute("cx", getX(bePn));
            pointEqPn.setAttribute("cy", yZero);
            pointEqPn.style.display = "block";
        } else {
            pointEqPn.style.display = "none";
        }

        if (beEmp > 0 && beEmp <= maxMotos) {
            pointEqEmp.setAttribute("cx", getX(beEmp));
            pointEqEmp.setAttribute("cy", yZero);
            pointEqEmp.style.display = "block";
        } else {
            pointEqEmp.style.display = "none";
        }

        // Setup mouse move tooltip
        svgChart.onmousemove = function(e) {
            const rect = svgChart.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            
            // Map mouse coordinates to values
            const svgWidthAttr = rect.width;
            const scaleX = width / svgWidthAttr;
            const canvasX = mouseX * scaleX;
            
            if (canvasX >= paddingLeft && canvasX <= width - paddingRight) {
                const pct = (canvasX - paddingLeft) / chartWidth;
                const m = pct * maxMotos;
                
                const f = calculateFinancials(m);
                const valPn = chartMode === 'utilidad' ? f.utilidadNetaPn : f.dineroPn;
                const valEmp = chartMode === 'utilidad' ? f.utilidadNetaEmp : f.dineroEmp;
                
                hoverLine.setAttribute("x1", canvasX);
                hoverLine.setAttribute("x2", canvasX);
                hoverLine.style.display = "block";
                
                // Show tooltip
                chartTooltip.style.display = "block";
                chartTooltip.style.left = `${mouseX + 12}px`;
                chartTooltip.style.top = `${e.clientY - rect.top - 60}px`;
                chartTooltip.innerHTML = `
                    <div style="font-weight:700; margin-bottom:4px;">Contratos: ${m.toFixed(1)} motos</div>
                    <div style="color:#60a5fa;">P. Natural: ${formatCurrency(valPn)}</div>
                    <div style="color:#a78bfa;">Empresa: ${formatCurrency(valEmp)}</div>
                `;
            } else {
                hoverLine.style.display = "none";
                chartTooltip.style.display = "none";
            }
        };
        
        svgChart.onmouseleave = function() {
            hoverLine.style.display = "none";
            chartTooltip.style.display = "none";
        };
    }

    // ----------------------------------------------------
    // TABLE GENERATION
    // ----------------------------------------------------
    function renderTable(f) {
        const factor = viewMode === "mensual" ? 1 : 12;
        
        const cuota = parseFloat(inputs.cuota.value) || 0;
        const motos = parseFloat(inputs.motos.value) || 0;
        const multiplier = parseFloat(inputs.multiplier.value) || 1;
        const pctAnticipo = parsePercent(inputs.percentAnticipo.value);
        const pctProvision = parsePercent(inputs.percentProvision.value);
        const pctArrendamiento = 1 - pctAnticipo - pctProvision;
        const honorarios = parseFloat(inputs.honorarios.value) || 0;
        const mantenimiento = parseFloat(inputs.mantenimiento.value) || 0;
        const smmlv = parseFloat(inputs.smmlv.value) || 0;
        const auxTrans = parseFloat(inputs.auxTrans.value) || 0;
        const pnNominaAdj = parseFloat(inputs.pnNominaAdj.value) || 0;
        const empresaNominaAdj = parseFloat(inputs.empresaNominaAdj.value) || 0;
        const uvtVal = parseFloat(inputs.uvt.value) || 52374;
        const creditoMeses = parseFloat(inputs.creditoMeses.value) || 12;
        const ivaRate = parsePercent(inputs.ivaRate.value);
        const rentaPnExento = 1090 * uvtVal;

        const ivaIncl = inputs.ivaIncluido ? inputs.ivaIncluido.checked : true;
        const ivaRatePct = ivaRate * 100;
        const ivaFormulaText = ivaIncl 
            ? `Si responsable: Ingreso Bruto - (Ingreso Bruto / (1 + ${ivaRatePct}%)). Si exento: 0.`
            : `Si responsable: Ingreso Bruto * ${ivaRatePct}%. Si exento: 0.`;
        
        const ivaCalcPnText = f.pnResponsableIva 
            ? (ivaIncl 
                ? `Responsable (supera 3.500 UVT).<br><strong>${formatCurrency(f.ingresoAnual / 12 * factor)}</strong> - (<strong>${formatCurrency(f.ingresoAnual / 12 * factor)}</strong> / <strong>${(1 + ivaRate).toFixed(2)}</strong>) = <strong>-${formatCurrency(f.ivaAnualPn / 12 * factor)}</strong>`
                : `Responsable (supera 3.500 UVT).<br><strong>${formatCurrency(f.ingresoAnual / 12 * factor)}</strong> * <strong>${ivaRatePct}%</strong> = <strong>-${formatCurrency(f.ivaAnualPn / 12 * factor)}</strong>`)
            : `Exento (no supera 3.500 UVT = ${formatCurrency(inputs.ivaThreshold.value)}).<br>Valor: <strong>$0</strong>`;

        const ivaCalcEmpText = ivaIncl 
            ? `Responsable desde el primer día.<br><strong>${formatCurrency(f.ingresoAnual / 12 * factor)}</strong> - (<strong>${formatCurrency(f.ingresoAnual / 12 * factor)}</strong> / <strong>${(1 + ivaRate).toFixed(2)}</strong>) = <strong>-${formatCurrency(f.ivaAnualEmp / 12 * factor)}</strong>`
            : `Responsable desde el primer día.<br><strong>${formatCurrency(f.ingresoAnual / 12 * factor)}</strong> * <strong>${ivaRatePct}%</strong> = <strong>-${formatCurrency(f.ivaAnualEmp / 12 * factor)}</strong>`;

        const netoFormulaPnText = ivaIncl 
            ? "Ingreso Bruto Total - Descuento IVA Recaudado" 
            : "Ingreso Bruto Total (el IVA se recauda por separado)";
        const netoCalcPnText = ivaIncl 
            ? `<strong>${formatCurrency(f.ingresoAnual / 12 * factor)}</strong> - <strong>${formatCurrency(f.ivaAnualPn / 12 * factor)}</strong> = <strong>${formatCurrency(f.ingresoTotalMotosMensualNetoPn * factor)}</strong>`
            : `<strong>${formatCurrency(f.ingresoAnual / 12 * factor)}</strong> = <strong>${formatCurrency(f.ingresoTotalMotosMensualNetoPn * factor)}</strong>`;

        const netoFormulaEmpText = ivaIncl 
            ? "Ingreso Bruto Total - Descuento IVA Recaudado" 
            : "Ingreso Bruto Total (el IVA se recauda por separado)";
        const netoCalcEmpText = ivaIncl 
            ? `<strong>${formatCurrency(f.ingresoAnual / 12 * factor)}</strong> - <strong>${formatCurrency(f.ivaAnualEmp / 12 * factor)}</strong> = <strong>${formatCurrency(f.ingresoTotalMotosMensualNetoEmp * factor)}</strong>`
            : `<strong>${formatCurrency(f.ingresoAnual / 12 * factor)}</strong> = <strong>${formatCurrency(f.ingresoTotalMotosMensualNetoEmp * factor)}</strong>`;

        // Helper to format HTML tooltips
        function makeTooltip(title, def, formula, calcPn, calcEmp) {
            return `
                <div class="tooltip-title-pop">${title}</div>
                <div class="tooltip-def-pop">${def}</div>
                <div class="tooltip-formula-pop"><strong>Fórmula:</strong> ${formula}</div>
                <div class="tooltip-calc-block">
                    <div class="tooltip-calc-title">Persona Natural (B):</div>
                    <div class="tooltip-calc-values">${calcPn}</div>
                </div>
                <div class="tooltip-calc-block">
                    <div class="tooltip-calc-title">Empresa / SAS (C):</div>
                    <div class="tooltip-calc-values">${calcEmp}</div>
                </div>
            `;
        }

        // List of rows to generate
        const rows = [
            { type: "header", label: "Ingresos Operacionales" },
            { 
                label: "Ingreso Bruto de Arrendamientos / Moto", 
                pn: f.arrendamientoPorMoto * factor, 
                emp: f.arrendamientoPorMoto * factor,
                tooltipHtml: makeTooltip(
                    "Ingreso Bruto / Moto",
                    "El valor del canon de arrendamiento neto que genera cada moto mensualmente o anualmente, según el factor de distribución asignado.",
                    "Cuota Base * % Arrendamiento * Factor de Periodo",
                    `<strong>${formatCurrency(cuota)}</strong> * <strong>${Math.round(pctArrendamiento * 100)}%</strong> * <strong>${factor}</strong> = <strong>${formatCurrency(f.arrendamientoPorMoto * factor)}</strong>`,
                    `<strong>${formatCurrency(cuota)}</strong> * <strong>${Math.round(pctArrendamiento * 100)}%</strong> * <strong>${factor}</strong> = <strong>${formatCurrency(f.arrendamientoPorMoto * factor)}</strong>`
                )
            },
            { 
                label: "Ingreso Bruto Total por Motos", 
                pn: (f.ingresoAnual / 12) * factor, 
                emp: (f.ingresoAnual / 12) * factor,
                tooltipHtml: makeTooltip(
                    "Ingreso Bruto Total",
                    "La facturación total bruta del negocio por la flota de motocicletas contratada, multiplicada por los cobros en el periodo.",
                    "Arrendamiento por Moto * Multiplicador * Cantidad Motos * Factor de Periodo",
                    `<strong>${formatCurrency(f.arrendamientoPorMoto)}</strong> * <strong>${multiplier}</strong> * <strong>${motos}</strong> * <strong>${factor}</strong> = <strong>${formatCurrency((f.ingresoAnual / 12) * factor)}</strong>`,
                    `<strong>${formatCurrency(f.arrendamientoPorMoto)}</strong> * <strong>${multiplier}</strong> * <strong>${motos}</strong> * <strong>${factor}</strong> = <strong>${formatCurrency((f.ingresoAnual / 12) * factor)}</strong>`
                )
            },
            { 
                label: "(-) Descuento IVA Recaudado", 
                pn: -(f.ivaAnualPn / 12 * factor), 
                emp: -(f.ivaAnualEmp / 12 * factor), 
                isExpense: true,
                tooltipHtml: makeTooltip(
                    "Deducción de IVA",
                    `Impuesto indirecto del ${ivaRatePct}% cobrado al cliente que debe ser devuelto al Estado. La S.A.S. lo paga desde el primer peso. La Persona Natural está exenta si factura menos de 3.500 UVT anuales.`,
                    ivaFormulaText,
                    ivaCalcPnText,
                    ivaCalcEmpText
                )
            },
            { 
                label: "Ingreso Neto Operacional", 
                pn: f.ingresoTotalMotosMensualNetoPn * factor, 
                emp: f.ingresoTotalMotosMensualNetoEmp * factor, 
                bold: true, 
                rowClass: "row-header",
                tooltipHtml: makeTooltip(
                    "Ingreso Neto Operacional",
                    "El ingreso real que pertenece al negocio, libre de IVA. Es la base imponible sobre la cual se calculan los gastos operativos e impuestos.",
                    viewMode === "mensual" ? "Ingreso Bruto Mensual - IVA Mensual" : "Ingreso Bruto Anual - IVA Anual",
                    netoCalcPnText,
                    netoCalcEmpText
                )
            },
            
            { type: "header", label: "Gastos de Administración y Operación" },
            { 
                label: "Nómina y Cargas Prestacionales", 
                pn: f.nominaPnMensual * factor, 
                emp: f.nominaEmpMensual * factor, 
                isExpense: true,
                tooltipHtml: makeTooltip(
                    "Nómina y Cargas Laborales",
                    "Persona Natural: Aportes directos a Salud (12.5%) y Pensión (16%) liquidados sobre su IBC. Empresa: Salario Mínimo (SMMLV), Auxilio de Transporte, Aportes Patronales (ARL, Caja, Pensión) y Prestaciones (Primas, Cesantías, Intereses, Vacaciones).",
                    "PN: (Salud + Pensión + Ajuste) * factor | SAS: (Costo Laboral por empleado × N° empleados + Ajuste fijo) * factor",
                    `IBC: <strong>${formatCurrency(f.ibc)}</strong> (40% del ingreso neto, limitado entre 1 y 25 SMMLV).<br>Salud (12.5%): ${formatCurrency(f.saludPn)}. Pensión (16%): ${formatCurrency(f.pensionPn)}.<br>Ajuste: ${formatCurrency(pnNominaAdj)}.<br>Total: (<strong>${formatCurrency(f.saludPn)}</strong> + <strong>${formatCurrency(f.pensionPn)}</strong> + <strong>${formatCurrency(pnNominaAdj)}</strong>) * <strong>${factor}</strong> = <strong>${formatCurrency(f.nominaPnMensual * factor)}</strong>`,
                    `SMMLV: ${formatCurrency(smmlv)} + Aux. Trans: ${formatCurrency(auxTrans)}.<br>Salud: ${f.exonerado ? "$0 (Exento)" : formatCurrency(f.saludEmp)} | Pensión (12%): ${formatCurrency(f.pensionEmp)} | ARL: ${formatCurrency(f.arlEmp)} | Caja (4%): ${formatCurrency(f.cajaEmp)} | Parafiscales: ${f.exonerado ? "$0 (Exento)" : formatCurrency(f.parafiscalesEmp)}.<br>Prestaciones (Prima, Cesantías, Intereses, Vacaciones): ${formatCurrency(f.prestacionesEmp)}.<br><strong>Costo por empleado: ${formatCurrency(f.totalNominaEmpCalculada)}</strong> × <strong>${f.numEmpleados} empleado${f.numEmpleados > 1 ? 's' : ''}</strong> = ${formatCurrency(f.totalNominaEmpCalculada * f.numEmpleados)}<br>+ Ajuste fijo: ${formatCurrency(empresaNominaAdj)}.<br>Total: <strong>${formatCurrency(f.nominaEmpMensual * factor)}</strong>`
                )
            },
            { 
                label: "Honorarios", 
                pn: honorarios * factor, 
                emp: honorarios * factor, 
                isExpense: true,
                tooltipHtml: makeTooltip(
                    "Honorarios Profesionales",
                    "Gasto de administración para cubrir asesorías externas (como el contador público de la S.A.S. o asesoría legal).",
                    "Honorarios mensuales * Factor de Periodo",
                    `<strong>${formatCurrency(honorarios)}</strong> * <strong>${factor}</strong> = <strong>${formatCurrency(honorarios * factor)}</strong>`,
                    `<strong>${formatCurrency(honorarios)}</strong> * <strong>${factor}</strong> = <strong>${formatCurrency(honorarios * factor)}</strong>`
                )
            },
            { 
                label: "Mantenimientos y Adecuaciones", 
                pn: 0, 
                emp: mantenimiento * factor, 
                isExpense: true,
                tooltipHtml: makeTooltip(
                    "Mantenimientos y Adecuaciones",
                    "Provisión de gastos mensuales para el mantenimiento de las motos y adecuaciones locativas (solo aplica al esquema de Empresa).",
                    "Mantenimiento mensual * Factor de Periodo",
                    `<strong>$0</strong> (No aplica en el esquema de Persona Natural)`,
                    `<strong>${formatCurrency(mantenimiento)}</strong> * <strong>${factor}</strong> = <strong>${formatCurrency(mantenimiento * factor)}</strong>`
                )
            },
            { 
                label: "Impuesto de Industria y Comercio (ICA)", 
                pn: (f.icaAnualPn / 12) * factor, 
                emp: (f.icaAnualEmp / 12) * factor, 
                isExpense: true,
                tooltipHtml: makeTooltip(
                    "Impuesto del ICA",
                    "Impuesto municipal liquidado sobre los ingresos netos operacionales de la actividad económica.",
                    "Ingreso Neto Operacional * Tarifa ICA * Factor de Periodo",
                    `<strong>${formatCurrency(f.ingresoTotalMotosMensualNetoPn * factor)}</strong> * <strong>${inputs.icaRate.value}%</strong> = <strong>${formatCurrency(f.icaAnualPn / 12 * factor)}</strong>`,
                    `<strong>${formatCurrency(f.ingresoTotalMotosMensualNetoEmp * factor)}</strong> * <strong>${inputs.icaRate.value}%</strong> = <strong>${formatCurrency(f.icaAnualEmp / 12 * factor)}</strong>`
                )
            },
            { 
                label: "Total Gastos Operativos", 
                pn: f.gastosMensualesPn * factor, 
                emp: f.gastosMensualesEmp * factor, 
                bold: true, 
                rowClass: "row-header", 
                isExpense: true,
                tooltipHtml: makeTooltip(
                    "Total Gastos Operativos",
                    "La sumatoria de todos los costos operativos de la actividad mercantil en el periodo seleccionado (excluyendo financiación y renta).",
                    "Nómina + Honorarios + Mantenimiento + ICA",
                    `<strong>${formatCurrency(f.nominaPnMensual * factor)}</strong> + <strong>${formatCurrency(honorarios * factor)}</strong> + <strong>${formatCurrency(f.icaAnualPn / 12 * factor)}</strong> = <strong>${formatCurrency(f.gastosMensualesPn * factor)}</strong>`,
                    `<strong>${formatCurrency(f.nominaEmpMensual * factor)}</strong> + <strong>${formatCurrency(honorarios * factor)}</strong> + <strong>${formatCurrency(mantenimiento * factor)}</strong> + <strong>${formatCurrency(f.icaAnualEmp / 12 * factor)}</strong> = <strong>${formatCurrency(f.gastosMensualesEmp * factor)}</strong>`
                )
            },
            
            { type: "header", label: "Flujo de Efectivo y Liquidez" },
            { 
                label: "Ingreso Flujo de Caja (Anticipos/Provisión)", 
                pn: f.flujoCajaMensual * factor, 
                emp: f.flujoCajaMensual * factor,
                tooltipHtml: makeTooltip(
                    "Abonos de Clientes (Flujo de Caja)",
                    "Dinero en efectivo que ingresa directamente por los anticipos y provisiones de compra. Aumenta el disponible bancario pero no cuenta como ganancia operacional.",
                    "Cuota Base * (% Anticipo + % Provisión) * Multiplicador * Motos * Factor de Periodo",
                    `<strong>${formatCurrency(cuota)}</strong> * (<strong>${inputs.percentAnticipo.value}%</strong> + <strong>${inputs.percentProvision.value}%</strong>) * <strong>${multiplier}</strong> * <strong>${motos}</strong> * <strong>${factor}</strong> = <strong>${formatCurrency(f.flujoCajaMensual * factor)}</strong>`,
                    `<strong>${formatCurrency(cuota)}</strong> * (<strong>${inputs.percentAnticipo.value}%</strong> + <strong>${inputs.percentProvision.value}%</strong>) * <strong>${multiplier}</strong> * <strong>${motos}</strong> * <strong>${factor}</strong> = <strong>${formatCurrency(f.flujoCajaMensual * factor)}</strong>`
                )
            },
            { 
                label: viewMode === "mensual" ? "Egresos Financieros (Crédito)" : "Egresos Financieros Anualizados (Crédito)", 
                pn: f.creditoMensual * factor, 
                emp: f.creditoMensual * factor, 
                isExpense: true,
                tooltipHtml: makeTooltip(
                    "Servicio de la Deuda",
                    "El pago mensual o acumulado para amortizar el crédito comercial utilizado para financiar las motos.",
                    "Pago Mensual de Crédito * Factor de Periodo",
                    `<strong>${formatCurrency(f.creditoMensual)}</strong> * <strong>${factor}</strong> = <strong>${formatCurrency(f.creditoMensual * factor)}</strong>`,
                    `<strong>${formatCurrency(f.creditoMensual)}</strong> * <strong>${factor}</strong> = <strong>${formatCurrency(f.creditoMensual * factor)}</strong>`
                )
            },
            { 
                label: viewMode === "mensual" ? "Flujo Neto Mensual (Liquidez)" : "Flujo Neto Anual (Liquidez)", 
                pn: f.liquidezMensualPn * factor, 
                emp: f.liquidezMensualEmp * factor, 
                bold: true, 
                colored: true,
                tooltipHtml: makeTooltip(
                    "Flujo de Caja Neto (Liquidez)",
                    "El saldo de dinero neto que queda en el periodo, sumando los anticipos de clientes y restando la cuota del crédito y los gastos operacionales.",
                    "Ingreso Neto Operacional - Gastos Operativos - Egresos Deuda + Flujo de Caja Anticipos",
                    `<strong>${formatCurrency(f.ingresoTotalMotosMensualNetoPn * factor)}</strong> - <strong>${formatCurrency(f.gastosMensualesPn * factor)}</strong> - <strong>${formatCurrency(f.creditoMensual * factor)}</strong> + <strong>${formatCurrency(f.flujoCajaMensual * factor)}</strong> = <strong>${formatCurrency(f.liquidezMensualPn * factor)}</strong>`,
                    `<strong>${formatCurrency(f.ingresoTotalMotosMensualNetoEmp * factor)}</strong> - <strong>${formatCurrency(f.gastosMensualesEmp * factor)}</strong> - <strong>${formatCurrency(f.creditoMensual * factor)}</strong> + <strong>${formatCurrency(f.flujoCajaMensual * factor)}</strong> = <strong>${formatCurrency(f.liquidezMensualEmp * factor)}</strong>`
                )
            },
            
            { type: "header", label: "Resultados del Ejercicio Anual" },
            { 
                label: "Utilidad antes de Impuesto de Renta", 
                pn: f.utilidadAntesRentaPn * (factor/12), 
                emp: f.utilidadAntesRentaEmp * (factor/12), 
                bold: true,
                tooltipHtml: makeTooltip(
                    "Utilidad antes de Impuestos",
                    "Rendimiento del negocio sobre el cual se calculará el impuesto de renta (ajustado al periodo).",
                    "Ingreso Neto Operacional - Gastos Operativos (ajustado al periodo)",
                    `<strong>${formatCurrency(f.ingresoAnualNetoPn * (factor/12))}</strong> - <strong>${formatCurrency(f.gastosAnualesPn * (factor/12))}</strong> = <strong>${formatCurrency(f.utilidadAntesRentaPn * (factor/12))}</strong>`,
                    `<strong>${formatCurrency(f.ingresoAnualNetoEmp * (factor/12))}</strong> - <strong>${formatCurrency(f.gastosAnualesEmp * (factor/12))}</strong> = <strong>${formatCurrency(f.utilidadAntesRentaEmp * (factor/12))}</strong>`
                )
            },
            { 
                label: viewMode === "mensual" ? "Impuesto de Renta Liquidado (Mensualizado)" : "Impuesto de Renta Liquidado (Anual)", 
                pn: f.rentaPnAnual * (factor/12), 
                emp: f.rentaEmpAnual * (factor/12), 
                isExpense: true,
                tooltipHtml: makeTooltip(
                    "Impuesto de Renta (DIAN)",
                    "Impuesto sobre la renta del ejercicio. S.A.S.: Tarifa plana (35%). Persona Natural: Tarifa progresiva por tramos en UVT del Art. 241 E.T. (exento de 0 a 1.090 UVT).",
                    "PN: Tabla progresiva DIAN (UVT) | SAS: Utilidad antes de Renta * Tarifa Renta (35%)",
                    `Base en UVT: <strong>${(f.utilidadAntesRentaPn / uvtVal).toFixed(1)}</strong> UVT.<br>Impuesto liquidado: <strong>${formatCurrency(f.rentaPnAnual * (factor/12))}</strong> (sobre UVT exenta de 1.090 UVT = ${formatCurrency(rentaPnExento)})`,
                    `Utilidad antes de Renta: ${formatCurrency(f.utilidadAntesRentaEmp * (factor/12))}.<br>Cálculo: <strong>${formatCurrency(f.utilidadAntesRentaEmp * (factor/12))}</strong> * <strong>${inputs.rentaEmpresaRate.value}%</strong> = <strong>${formatCurrency(f.rentaEmpAnual * (factor/12))}</strong>`
                )
            },
            { 
                label: "Utilidad Neta del Ejercicio", 
                pn: f.utilidadNetaPn * (factor/12), 
                emp: f.utilidadNetaEmp * (factor/12), 
                bold: true, 
                rowClass: "row-total",
                tooltipHtml: makeTooltip(
                    "Utilidad Neta",
                    "La ganancia neta del ejercicio después de liquidar los impuestos ante la DIAN (ajustada al periodo).",
                    "Utilidad antes de Renta - Impuesto de Renta",
                    `<strong>${formatCurrency(f.utilidadAntesRentaPn * (factor/12))}</strong> - <strong>${formatCurrency(f.rentaPnAnual * (factor/12))}</strong> = <strong>${formatCurrency(f.utilidadNetaPn * (factor/12))}</strong>`,
                    `<strong>${formatCurrency(f.utilidadAntesRentaEmp * (factor/12))}</strong> - <strong>${formatCurrency(f.rentaEmpAnual * (factor/12))}</strong> = <strong>${formatCurrency(f.utilidadNetaEmp * (factor/12))}</strong>`
                )
            },
            { 
                label: viewMode === "mensual" ? "Amortización de Deuda (Mensual)" : "Crédito Total Anualizado", 
                pn: f.creditoAnual * (factor/12), 
                emp: f.creditoAnual * (factor/12), 
                isExpense: true,
                tooltipHtml: makeTooltip(
                    "Crédito Acumulado",
                    "El total acumulado de las cuotas del crédito pagadas en el periodo.",
                    "Crédito Mensual * Meses de amortización (ajustado al periodo)",
                    `<strong>${formatCurrency(f.creditoMensual)}</strong> * <strong>${viewMode === "mensual" ? "1" : creditoMeses}</strong> = <strong>${formatCurrency(f.creditoAnual * (factor/12))}</strong>`,
                    `<strong>${formatCurrency(f.creditoMensual)}</strong> * <strong>${viewMode === "mensual" ? "1" : creditoMeses}</strong> = <strong>${formatCurrency(f.creditoAnual * (factor/12))}</strong>`
                )
            },
            { 
                label: "Excedente de Caja Final (Dinero Real)", 
                pn: f.dineroPn * (factor/12), 
                emp: f.dineroEmp * (factor/12), 
                bold: true, 
                colored: true, 
                rowClass: "row-total",
                tooltipHtml: makeTooltip(
                    "Excedente de Caja Final",
                    "La caja libre neta final disponible para el propietario al término del periodo. Representa la utilidad neta, sumando los anticipos/provisiones que entraron a caja y restando la deuda pagada.",
                    "Utilidad Neta - Crédito Total + Flujo de Caja (Anticipos)",
                    `<strong>${formatCurrency(f.utilidadNetaPn * (factor/12))}</strong> - <strong>${formatCurrency(f.creditoAnual * (factor/12))}</strong> + <strong>${formatCurrency(f.flujoCajaAnual * (factor/12))}</strong> = <strong>${formatCurrency(f.dineroPn * (factor/12))}</strong>`,
                    `<strong>${formatCurrency(f.utilidadNetaEmp * (factor/12))}</strong> - <strong>${formatCurrency(f.creditoAnual * (factor/12))}</strong> + <strong>${formatCurrency(f.flujoCajaAnual * (factor/12))}</strong> = <strong>${formatCurrency(f.dineroEmp * (factor/12))}</strong>`
                )
            }
        ];

        tableBody.innerHTML = "";
        
        // Ensure global tooltip exists
        let globalTooltip = document.getElementById("global-tooltip");
        if (!globalTooltip) {
            globalTooltip = document.createElement("div");
            globalTooltip.id = "global-tooltip";
            document.body.appendChild(globalTooltip);
        }

        rows.forEach(r => {
            if (r.type === "header") {
                const tr = document.createElement("tr");
                tr.className = "row-header";
                tr.innerHTML = `
                    <td colspan="4" style="font-weight:700; color:var(--text-primary); border-top: 2px solid var(--border-color);">${r.label}</td>
                `;
                tableBody.appendChild(tr);
                return;
            }

            const tr = document.createElement("tr");
            if (r.rowClass) tr.className = r.rowClass;
            
            const diff = r.emp - r.pn;
            const diffFormatted = diff === 0 ? "-" : formatCurrency(diff);
            
            let valPnText = formatCurrency(r.pn);
            let valEmpText = formatCurrency(r.emp);
            
            let valPnClass = "";
            let valEmpClass = "";
            
            if (r.colored) {
                valPnClass = r.pn >= 0 ? "value-positive" : "value-negative";
                valEmpClass = r.emp >= 0 ? "value-positive" : "value-negative";
            }
            
            let labelStyle = r.bold ? "font-weight:700; color:var(--text-primary);" : "";
            
            // Lógica de color de diferencia invertida para gastos/egresos
            let diffClass = "value-neutral";
            if (diff !== 0) {
                if (r.isExpense) {
                    diffClass = diff < 0 ? "value-positive" : "value-negative"; // Menos gasto es positivo para Empresa
                } else {
                    diffClass = diff > 0 ? "value-positive" : "value-negative"; // Más ingreso es positivo para Empresa
                }
            }
            
            tr.innerHTML = `
                <td style="${labelStyle} padding-left: 24px;">
                    <span class="tooltip-trigger" style="border-bottom: 1px dashed var(--text-muted); cursor: help; display: inline-block;">${r.label}</span>
                </td>
                <td class="col-pn ${valPnClass}" style="${r.bold ? 'font-weight:700;' : ''}">${valPnText}</td>
                <td class="col-empresa ${valEmpClass}" style="${r.bold ? 'font-weight:700;' : ''}">${valEmpText}</td>
                <td style="font-weight: 600;" class="${diffClass}">${diffFormatted}</td>
            `;
            
            tableBody.appendChild(tr);

            // Add tooltip event listeners to the span
            const trigger = tr.querySelector(".tooltip-trigger");
            if (trigger && r.tooltipHtml) {
                trigger.addEventListener("mouseenter", (e) => {
                    globalTooltip.innerHTML = r.tooltipHtml;
                    globalTooltip.style.display = "block";
                    globalTooltip.style.opacity = "1";
                });
                
                trigger.addEventListener("mousemove", (e) => {
                    const tooltipWidth = globalTooltip.offsetWidth || 320;
                    const tooltipHeight = globalTooltip.offsetHeight || 150;
                    
                    let left = e.pageX + 15;
                    let top = e.pageY + 15;
                    
                    // Prevent tooltip from overflowing the viewport width
                    if (left + tooltipWidth > window.innerWidth) {
                        left = e.pageX - tooltipWidth - 15;
                    }
                    // Prevent tooltip from overflowing the viewport height
                    if (top + tooltipHeight > window.innerHeight + window.scrollY) {
                        top = e.pageY - tooltipHeight - 15;
                    }
                    
                    globalTooltip.style.left = `${left}px`;
                    globalTooltip.style.top = `${top}px`;
                });
                
                trigger.addEventListener("mouseleave", () => {
                    globalTooltip.style.display = "none";
                    globalTooltip.style.opacity = "0";
                });
            }
        });
    }

    // ----------------------------------------------------
    // VIEW UPDATER
    // ----------------------------------------------------
    function update() {
        // 1. Calculate financials for currently selected motos
        const f = calculateFinancials();

        // 1.5 Update Payroll Modal Cells
        if (modalCells.pnSalario) {
            const smmlvVal = parseFloat(inputs.smmlv.value) || 0;
            const auxTransVal = parseFloat(inputs.auxTrans.value) || 0;
            
            modalCells.pnSalario.textContent = "$0 (Es propio)";
            modalCells.empSalario.textContent = formatCurrency(smmlvVal);
            
            modalCells.pnAuxtrans.textContent = "$0";
            modalCells.empAuxtrans.textContent = formatCurrency(auxTransVal);
            
            modalCells.descSalud.textContent = `12.5% sobre IBC (${formatCurrency(f.ibc)})`;
            modalCells.pnSalud.textContent = formatCurrency(f.saludPn);
            modalCells.empSalud.textContent = f.exonerado ? "$0 (Exento)" : formatCurrency(f.saludEmp);
            
            modalCells.descPension.textContent = `16% sobre IBC (${formatCurrency(f.ibc)}) / 12% SAS`;
            modalCells.pnPension.textContent = formatCurrency(f.pensionPn);
            modalCells.empPension.textContent = formatCurrency(f.pensionEmp);
            
            modalCells.empArl.textContent = formatCurrency(f.arlEmp);
            modalCells.empCaja.textContent = formatCurrency(f.cajaEmp);
            
            modalCells.descParafiscales.textContent = f.exonerado ? "SAS Exenta (Art. 114-1 ET)" : "5% (SENA 2% + ICBF 3%)";
            modalCells.empParafiscales.textContent = f.exonerado ? "$0 (Exento)" : formatCurrency(f.parafiscalesEmp);
            
            modalCells.empPrima.textContent = formatCurrency(f.primaEmp);
            modalCells.empCesantias.textContent = formatCurrency(f.cesantiasEmp);
            modalCells.empIntereses.textContent = formatCurrency(f.interesesCesantiasEmp);
            modalCells.empVacaciones.textContent = formatCurrency(f.vacacionesEmp);
            
            // Fila de totales: por empleado
            modalCells.pnTotal.textContent = formatCurrency(f.totalNominaPnCalculada);
            modalCells.empTotal.textContent = formatCurrency(f.totalNominaEmpCalculada);

            // Fila adicional cuando hay más de 1 empleado
            const totalRow = document.getElementById("modal-row-total-empleados");
            const countLabel = document.getElementById("modal-emp-count-label");
            const totalGlobal = document.getElementById("modal-emp-total-global");
            if (totalRow && countLabel && totalGlobal) {
                if (f.numEmpleados > 1) {
                    totalRow.style.display = "";
                    countLabel.textContent = `(${f.numEmpleados} empleados)`;
                    totalGlobal.textContent = formatCurrency(f.nominaEmpMensual);
                } else {
                    totalRow.style.display = "none";
                }
            }
        }

        // 2. Update KPI cards
        metrics.pnUtilidad.textContent = formatCurrency(f.utilidadNetaPn);
        metrics.pnDinero.textContent = formatCurrency(f.dineroPn);
        metrics.pnRenta.textContent = `Impuesto Renta: ${formatCurrency(f.rentaPnAnual)}`;
        metrics.pnIva.textContent = `IVA: ${formatCurrency(f.ivaAnualPn)}`;
        
        // Add color styles on net dinero
        metrics.pnDinero.className = f.dineroPn >= 0 ? "metric-value-cash value-positive" : "metric-value-cash value-negative";

        metrics.empUtilidad.textContent = formatCurrency(f.utilidadNetaEmp);
        metrics.empDinero.textContent = formatCurrency(f.dineroEmp);
        metrics.empRenta.textContent = `Impuesto Renta: ${formatCurrency(f.rentaEmpAnual)}`;
        metrics.empIva.textContent = `IVA: ${formatCurrency(f.ivaAnualEmp)}`;
        metrics.empDinero.className = f.dineroEmp >= 0 ? "metric-value-cash value-positive" : "metric-value-cash value-negative";

        // 3. Calculate Break-Evens
        const bePnUtilidad = calculateBreakEvenPoint('pn', 'utilidad');
        const bePnDinero = calculateBreakEvenPoint('pn', 'dinero');
        const beEmpUtilidad = calculateBreakEvenPoint('emp', 'utilidad');
        const beEmpDinero = calculateBreakEvenPoint('emp', 'dinero');

        // Display current target mode break even
        if (chartMode === 'utilidad') {
            metrics.eqMotosPn.textContent = bePnUtilidad > 0 ? bePnUtilidad.toFixed(1) : "N/A";
            metrics.eqDescPn.textContent = bePnUtilidad > 0 ? `Requiere facturar ${formatCurrency(bePnUtilidad * f.arrendamientoPorMoto * parseFloat(inputs.multiplier.value))} mensuales de arrendamiento.` : "No alcanza punto de equilibrio.";
            
            metrics.eqMotosEmp.textContent = beEmpUtilidad > 0 ? beEmpUtilidad.toFixed(1) : "N/A";
            metrics.eqDescEmp.textContent = beEmpUtilidad > 0 ? `Requiere facturar ${formatCurrency(beEmpUtilidad * f.arrendamientoPorMoto * parseFloat(inputs.multiplier.value))} mensuales de arrendamiento.` : "No alcanza punto de equilibrio.";
        } else {
            metrics.eqMotosPn.textContent = bePnDinero > 0 ? bePnDinero.toFixed(1) : "N/A";
            metrics.eqDescPn.textContent = bePnDinero > 0 ? `Requiere facturar ${formatCurrency(bePnDinero * f.arrendamientoPorMoto * parseFloat(inputs.multiplier.value))} mensuales de arrendamiento.` : "No alcanza punto de equilibrio de caja.";
            
            metrics.eqMotosEmp.textContent = beEmpDinero > 0 ? beEmpDinero.toFixed(1) : "N/A";
            metrics.eqDescEmp.textContent = beEmpDinero > 0 ? `Requiere facturar ${formatCurrency(beEmpDinero * f.arrendamientoPorMoto * parseFloat(inputs.multiplier.value))} mensuales de arrendamiento.` : "No alcanza punto de equilibrio de caja.";
        }

        // 4. Redraw Chart
        renderChart();

        // 5. Redraw Table
        renderTable(f);
    }

    // Run initial calculations
    handlePercentSliders();
    update();

    // Expose to window for debugging
    window.calculateFinancials = calculateFinancials;
    window.update = update;

    try {
        console.log("DEBUG_FINANCIALS_40", calculateFinancials(40));
        console.log("DEBUG_FINANCIALS_0", calculateFinancials(0));
        console.log("DEBUG_INPUTS", inputs);
    } catch(e) {
        console.error("DEBUG_ERROR", e);
    }

    // PDF generation handler
    function generatePDF() {
        // The UMD build from unpkg exposes window.jspdf = { jsPDF: ... }
        // Log what we find so we can debug if something is still wrong
        console.log('window.jspdf:', window.jspdf);
        console.log('window.jsPDF:', window.jsPDF);

        let jsPDFConstructor = null;

        // UMD bundle: window.jspdf.jsPDF
        if (window.jspdf && typeof window.jspdf.jsPDF === 'function') {
            jsPDFConstructor = window.jspdf.jsPDF;
        }
        // Some builds assign directly to window.jsPDF
        else if (typeof window.jsPDF === 'function') {
            jsPDFConstructor = window.jsPDF;
        }
        // Fallback: window.jspdf itself might be the constructor
        else if (typeof window.jspdf === 'function') {
            jsPDFConstructor = window.jspdf;
        }

        if (!jsPDFConstructor) {
            alert('No se pudo cargar la librería jsPDF. Verifica tu conexión a internet y recarga la página.');
            console.error('jsPDF library is not loaded. window.jspdf=', window.jspdf, 'window.jsPDF=', window.jsPDF);
            return;
        }

        const doc = new jsPDFConstructor();
        doc.setFontSize(18);
        doc.text('Informe Financiero', 14, 22);
        const table = document.querySelector('table.financial-table');
        if (table && typeof doc.autoTable === 'function') {
            doc.autoTable({ html: table, startY: 30 });
        } else {
            console.warn('autoTable plugin not available or table not found. doc.autoTable=', typeof doc.autoTable);
        }
        doc.save('Informe_Financiero.pdf');
    }
    const pdfBtn = document.getElementById('btn-download-pdf');
    if (pdfBtn) {
        pdfBtn.addEventListener('click', generatePDF);
    }
});
