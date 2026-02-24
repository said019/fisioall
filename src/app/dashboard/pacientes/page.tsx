export default function PacientesPage() {
    return (
        <div className="flex h-full flex-col items-center justify-center p-8 bg-background rounded-xl border border-border shadow-sm">
            <h2 className="text-2xl font-bold tracking-tight mb-2">Pacientes y Expedientes</h2>
            <p className="text-muted-foreground text-center max-w-md">
                Directorio de pacientes. Aquí podrás ver su historial clínico, diagnósticos, evolución del dolor y notas SOAP.
            </p>
        </div>
    );
}
